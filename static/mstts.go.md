```go
package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var enterbytes = []byte("\r\n")

var audiobuff []byte
var readDoneChans map[string]chan interface{}
var done chan interface{}
var interrupt chan os.Signal

var conn *websocket.Conn

var msTTSHeader = "Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n\n{\n    \"context\": {\n        \"synthesis\": {\n            \"audio\": {\n                \"metadataoptions\": {\n                    \"sentenceBoundaryEnabled\": \"false\",\n                    \"wordBoundaryEnabled\": \"true\"\n                },\n                \"outputFormat\": \"audio-24khz-48kbitrate-mono-mp3\" \n            }\n        }\n    }\n}"

func receiveHandler(connection *websocket.Conn) {
	defer close(done)
	log.Println("receiveHandler 1")
	for {
		log.Println("receiveHandler 2")
		_, msg, err := connection.ReadMessage()
		log.Println("receiveHandler 3")
		if err != nil {
			conn = nil
			log.Println("Error in receive:", err)
			return
		}
		log.Println("receiveHandler 4")
		// log.Printf("Received: %s\n", msg)
		line, after, ok := bytes.Cut(msg, enterbytes)
		log.Println("receiveHandler 5")
		if !ok {
			continue
		}
		k, v, ok := getKV(line)
		if ok {
			log.Printf("Received %s: %s\n", k, v)
		}
		requestID := v
		line, after, ok = bytes.Cut(after, enterbytes)
		if !ok {
			continue
		}
		k, v, ok = getKV(line)
		contentType := ""
		if ok {
			log.Printf("Received %s: %s\n", k, v)
			if k == "Content-Type" {
				contentType = v
			}
		}
		line, after, ok = bytes.Cut(after, enterbytes)
		if !ok {
			continue
		}
		k, v, ok = getKV(line)
		if ok {
			log.Printf("Received %s: %s\n", k, v)
			if k == "Content-Type" {
				contentType = v
			}
			if v == "turn.end" {
				readDoneChans[requestID] <- v
				continue
			}
		}
		line, after, ok = bytes.Cut(after, enterbytes)
		if !ok {
			continue
		}
		k, v, ok = getKV(line)
		if ok {
			log.Printf("Received %s: %s\n", k, v)
		}
		if contentType == "audio/mpeg" {
			audiobuff = append(audiobuff, after...)
		}
	}
}

func sendMessage(conn *websocket.Conn, requestID string, text string, lang string, voiceName string, pitch string, rate string, volume string) {
	ssml := getSSMLRequestContent(requestID, text, lang, voiceName, pitch, rate, volume)
	log.Println("ssml:", ssml)
	conn.WriteMessage(websocket.TextMessage, []byte(ssml))
}

func main() {
	audiobuff = make([]byte, 0)
	readDoneChans = make(map[string]chan interface{})
	interrupt = make(chan os.Signal) // Channel to listen for interrupt signal to terminate gracefully

	signal.Notify(interrupt, os.Interrupt) // Notify the interrupt channel for SIGINT

	http.HandleFunc("/ms", func(w http.ResponseWriter, r *http.Request) {
		// text string, lang string, voiceName string, pitch string, rate string, volume string
		q := r.URL.Query().Get("q")
		lang := r.URL.Query().Get("lang")
		voice := r.URL.Query().Get("voice")
		pitch := r.URL.Query().Get("pitch") + "%"
		rate := r.URL.Query().Get("rate")
		volume := r.URL.Query().Get("volume")

		log.Println("ms ==>", q, lang, voice, pitch, rate, volume)

		requestID := connectID()
		readDoneChan := make(chan interface{})
		readDoneChans[requestID] = readDoneChan
		defer close(readDoneChan)

		if conn == nil {
			startWebSocketConn()
		}
		sendMessage(conn, requestID, q, lang, voice, pitch, rate, volume)

		_, ok := <-readDoneChan
		if ok {
			log.Printf("Read done, len: %d", len(audiobuff))

			audiobuffCopy := make([]byte, len(audiobuff))
			copy(audiobuffCopy, audiobuff)
			audiobuff = audiobuff[0:0]
			delete(readDoneChans, requestID)

			w.Header().Set("Content-Type", "audio/mpeg")
			w.Header().Set("Content-Length", strconv.Itoa(len(audiobuffCopy)))
			w.WriteHeader(200)
			w.Write(audiobuffCopy)
		} else {
			w.WriteHeader(500)
		}
	})
	http.HandleFunc("/gg", func(w http.ResponseWriter, r *http.Request) {})
	go func() {
		if err := http.ListenAndServe(":8080", nil); err != nil {
			log.Fatal(err)
		}
	}()

	// 		// We received a SIGINT (Ctrl + C). Terminate gracefully...
	<-interrupt

	log.Println("Received SIGINT interrupt signal. Closing all pending connections")

	if conn == nil {
		return
	}

	// Close our websocket connection
	err := conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	conn = nil
	if err != nil {
		log.Println("Error during closing websocket:", err)
		return
	}

	select {
	case <-done:
		log.Println("Receiver Channel Closed! Exiting....")
	case <-time.After(time.Duration(1) * time.Second):
		log.Println("Timeout in closing receiving channel. Exiting....")
	}

	// Our main loop for the client
	// We send our relevant packets here
	// for {
	// 	select {
	// 	case <-time.After(time.Duration(1) * time.Millisecond * 1000):
	// 		log.Println("start server")
	// 	case <-interrupt:
	// 		// We received a SIGINT (Ctrl + C). Terminate gracefully...
	// 		log.Println("Received SIGINT interrupt signal. Closing all pending connections")

	// 		// Close our websocket connection
	// 		err := conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	// 		if err != nil {
	// 			log.Println("Error during closing websocket:", err)
	// 			return
	// 		}

	// 		select {
	// 		case <-done:
	// 			log.Println("Receiver Channel Closed! Exiting....")
	// 		case <-time.After(time.Duration(1) * time.Second):
	// 			log.Println("Timeout in closing receiving channel. Exiting....")
	// 		}
	// 		return
	// 	}
	// }
}

func startWebSocketConn() {
	done = make(chan interface{}) // Channel to indicate that the receiverHandler is done

	dialer := &websocket.Dialer{
		Proxy:             http.ProxyFromEnvironment,
		HandshakeTimeout:  120 * time.Second,
		EnableCompression: true,
	}

	header := http.Header{
		"Pragma":          []string{"no-cache"},
		"Cache-Control":   []string{"no-cache"},
		"Origin":          []string{"chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold"},
		"Accept-Encoding": []string{"gzip, deflate, br"},
		"Accept-Language": []string{"en-US,en;q=0.9"},
		"User-Agent":      []string{"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.41"},
	}

	dialCtx, dialContextCancel := context.WithTimeout(context.Background(), time.Duration(120)*time.Second)
	defer func() {
		dialContextCancel()
	}()

	edgettsurl := "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=" + uuid.New().String()
	var err error
	if conn, _, err = dialer.DialContext(dialCtx, edgettsurl, header); err != nil {
		log.Fatal("Error connecting to Websocket Server:", err)
	}
	// defer conn.Close()

	go receiveHandler(conn)

	log.Println("msTTSHeader:", msTTSHeader)

	conn.WriteMessage(websocket.TextMessage, []byte(msTTSHeader))
}

func getSSMLRequestContent(requestID, text string, lang string, voiceName string, pitch string, rate string, volume string) string {
	return ssmlHeadersPlusData(
		requestID,
		dateToString(),
		mkSSML(text, lang, voiceName, rate, volume, pitch),
	)
}

// ssmlHeadersPlusData returns the headers and data to be used in the request.
func ssmlHeadersPlusData(requestID string, timestamp string, ssml string) string {
	headersAndData := fmt.Sprintf(
		"X-RequestId:%s\r\n"+
			"Content-Type:application/ssml+xml\r\n"+
			"X-Timestamp:%sZ\r\n"+
			"Path:ssml\r\n\r\n"+
			"%s",
		requestID, timestamp, ssml)
	return headersAndData
}

// connectID generates a UUID without dashes.
func connectID() string {
	u := uuid.New()
	return strings.ReplaceAll(u.String(), "-", "")
}

// dateToString returns a JavaScript-style date string.
func dateToString() string {
	utcTime := time.Now().UTC()
	timeString := utcTime.Format("Mon Jan 02 2006 15:04:05 GMT+0000 (Coordinated Universal Time)")
	return timeString
}

// mkSSML creates an SSML string from the given parameters.
func mkSSML(text string, lang string, voice string, rate string, volume string, pitch string) string {
	ssml := fmt.Sprintf("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='%s'><voice name='%s'><prosody pitch='%s' rate='%s' volume='%s'>%s</prosody></voice></speak>", lang, voice, pitch, rate, volume, text)
	return ssml
}

func getKV(line []byte) (key string, v string, ok bool) {
	split := strings.Split(string(line), ":")
	if len(split) < 2 {
		return "", "", false
	}
	return split[0], split[1], true
}
```