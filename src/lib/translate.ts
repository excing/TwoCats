export const TranslaterChannels = {
  Edge: 0,
  Chrome: 1,
};

export class TranslateResult {
  text: string = '';
  origSens: Array<string> = [];
  tranSens: Array<string> = [];
  sentCount: number = 0;

  query: string = '';
  sl: string = 'auto';
  /**
   * 默认翻译为当前浏览器语言
   */
  tl: string = '';
}

export function translate(q: string, sl: string, tl: string, channel: number = TranslaterChannels.Edge) {
  if (TranslaterChannels.Edge == channel) {
    return edgeBrowserTranslate(q, sl, tl);
  }

  return chromeBrowserTranslate(q, sl, tl);
}

var edgeBrowserToken: string = '';

/**
[
  {
    "translations": [
      {
        "text": "你好吗？我很好，你呢？",
        "to": "zh-Hans",
        "sentLen": {
          "srcSentLen": [
            13,
            19
          ],
          "transSentLen": [
            4,
            7
          ]
        }
      }
    ]
  }
]
 */
export function edgeBrowserTranslate(q: string, sl: string, tl: string) {
  let toResult = function (data: any): TranslateResult {
    let result = new TranslateResult();
    result.query = q;
    result.sl = sl;
    result.tl = tl;
    if (!data || data.length === 0) return result;
    let translations = data[0].translations;
    if (!translations || !translations[0]) return result;
    let translation = translations[0];
    result.text = translation.text;
    result.tl = translation.to;
    result.sentCount = translation.sentLen.srcSentLen.length;
    for (let index = 0; index < result.sentCount; index++) {
      let srcSentStart = index == 0 ? 0 : translation.sentLen.srcSentLen[index - 1];
      let srcSentEnd = translation.sentLen.srcSentLen[index];
      let transSentStart = index == 0 ? 0 : translation.sentLen.transSentLen[index - 1];
      let transSentEnd = translation.sentLen.transSentLen[index];
      result.origSens[index] = q.substring(srcSentStart, srcSentEnd);
      result.tranSens[index] = translation.text.substring(transSentStart, transSentEnd);
    }
    return result;
  }
  let trans = async function (resolve: (value: TranslateResult) => void, reject: (reason?: any) => void) {
    try {
      let queryArr = [{ Text: q }]
      const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?from=${sl}&to=${tl}&api-version=3.0&includeSentenceLength=true`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        // mode: "cors", // no-cors, *cors, same-origin
        // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${edgeBrowserToken}`,
        },
        // redirect: "follow", // manual, *follow, error
        // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(queryArr), // body data type must match "Content-Type" header
      });
      const data = await response.json();
      return resolve(toResult(data));
    } catch (e) {
      edgeBrowserToken = '';
      reject(e);
    }
  }
  // We call resolve(...) when what we were doing asynchronously was successful, 
  // and reject(...) when it failed.
  return new Promise((resolve: (value: TranslateResult) => void, reject) => {
    if (edgeBrowserToken === '') {
      fetch('https://edge.microsoft.com/translate/auth').
        then(response => response.text()).
        then(token => {
          edgeBrowserToken = token
          trans(resolve, reject)
        }).
        catch(e => reject(e))
    } else {
      trans(resolve, reject)
    }
  });
}

/**
{
    "sentences": [
        {
            "trans": "你今年多大？ ",
            "orig": "How old are you?",
            "backend": 10
        },
        {
            "trans": "16.",
            "orig": "16.",
            "backend": 3,
            "model_specification": [
                {}
            ],
            "translation_engine_debug_info": [
                {
                    "model_tracking": {
                        "checkpoint_md5": "6ffafab0da7e640be86ac09d0d5e539c",
                        "launch_doc": "en_zh_2023q1.md"
                    }
                }
            ]
        },
        {
            "translit": "Nǐ jīnnián duōdà? 16."
        }
    ],
    "src": "en",
    "alternative_translations": [
        {
            "src_phrase": "How old are you?",
            "alternative": [
                {
                    "word_postproc": "你今年多大？",
                    "score": 1000,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        10
                    ]
                },
                {
                    "word_postproc": "你几岁？",
                    "score": 1000,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        1
                    ]
                },
                {
                    "word_postproc": "你多大了？",
                    "score": 1000,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        1,
                        8
                    ]
                },
                {
                    "word_postproc": "你几岁了？",
                    "score": 0,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        3
                    ],
                    "backend_infos": [
                        {
                            "backend": 3
                        }
                    ]
                }
            ],
            "srcunicodeoffsets": [
                {
                    "begin": 0,
                    "end": 16
                }
            ],
            "raw_src_segment": "How old are you?",
            "start_pos": 0,
            "end_pos": 0
        },
        {
            "src_phrase": "16.",
            "alternative": [
                {
                    "word_postproc": "16.",
                    "score": 0,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        3
                    ],
                    "backend_infos": [
                        {
                            "backend": 3
                        }
                    ]
                },
                {
                    "word_postproc": "16。",
                    "score": 0,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        8
                    ]
                }
            ],
            "srcunicodeoffsets": [
                {
                    "begin": 0,
                    "end": 3
                }
            ],
            "raw_src_segment": "16.",
            "start_pos": 0,
            "end_pos": 0
        }
    ],
    "confidence": 1.0,
    "spell": {},
    "ld_result": {
        "srclangs": [
            "en"
        ],
        "srclangs_confidences": [
            1.0
        ],
        "extended_srclangs": [
            "en"
        ]
    }
}
 */
export function chromeBrowserTranslate(q: string, sl: string, tl: string) {
  // https://translate.googleapis.com/translate_a/single?client=gtx&sl=pl&tl=zh-CN&hl=zh-CN&dt=t&dt=bd&dj=1&source=icon&tk=100000.999999&q=
  // https://developer.mozilla.org/api/v1/whoami

  let toResult = function (data: any): TranslateResult {
    let result = new TranslateResult();
    result.query = q;
    result.sl = data.src;
    result.tl = tl;
    let sentences = data.sentences;
    if (!sentences) return result;
    for (let index = 0; index < sentences.length; index++) {
      const element = sentences[index];
      if (element.trans) {
        result.sentCount++;
        result.text += element.trans;
        result.origSens[index] = element.orig;
        result.tranSens[index] = element.trans;
      }
    }
    return result;
  }
  return new Promise((resolve: (value: TranslateResult) => void, reject) => {
    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=at&dt=bd&dt=ex&dt=md&dt=rw&dt=ss&dt=rm&dj=1&source=icon&q=${q}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => resolve(toResult(data)))
      .catch(e => reject(e))
  })
}