# 方法一. 利用 google的页面翻译，存成MP3. 不需要登录。缺点是无法调速。
googleTrans.js
# googlespeech
use google translation to record as MP3

this can be used to learn English phrases or setences. it also can be used to lead-reading stuff.

the dependecy is windows notejs and puppeteer.

# 方法二. 利用deepmind的人工智能， wavenet api， 由text生成 speech
https://cloud.google.com/text-to-speech/docs/quickstart
https://cloud.google.com/text-to-speech/docs/create-audio
https://cloud.google.com/sdk/docs/quickstart-linux

gcloud init --console-only

## 必需建立服务帐号，准备好环境

gcloud iam service-accounts create speech  #如果已经存在，则不需要此步骤

# 此步不一定必要。 gcloud projects add-iam-policy-binding [PROJECT_ID] --member "serviceAccount:[NAME]@[PROJECT_ID].iam.gserviceaccount.com" --role "roles/owner"

gcloud iam service-accounts keys create key.json --iam-account=speech@speechwavenet.iam.gserviceaccount.com

环境变量
linux:
export GOOGLE_APPLICATION_CREDENTIALS=key.json
export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"

windows:
powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\username\Downloads\[FILE_NAME].json"
cmd
set GOOGLE_APPLICATION_CREDENTIALS=[PATH]

https://stackoverflow.com/questions/44184869/google-cloud-shell-is-using-project-cloud-devshell-dev-instead-of-my-actual-proj?rq=1
    
    
## 使用curl 工具 生成语音数据文件，以txt文件存起来    
curl \
  -H "Authorization: Bearer "$(gcloud auth application-default print-access-token) \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "{
    'input':{
      'text':'Android is a mobile operating system developed by Google,
         based on the Linux kernel and designed primarily for
         touchscreen mobile devices such as smartphones and tablets.'
    },
    'voice':{
      'languageCode':'en-US',
      'name':'en-US-Wavenet-A',
      'ssmlGender':'MALE'
    },
    'audioConfig':{
      'audioEncoding':'MP3'
    }
  }" "https://texttospeech.googleapis.com/v1beta1/text:synthesize" > synthesize-text.txt

## 男女声音类型
en-US-Wavenet-A	MALE
en-US-Wavenet-B	MALE
en-US-Wavenet-C	FEMALE
en-US-Wavenet-D	MALE
en-US-Wavenet-E	FEMALE
en-US-Wavenet-F	FEMALE

## 配置语速及生成语音的格式
'audioConfig':{
      'audioEncoding':'MP3',
      'speakingRate':1.0, //[0.25, 4.0]
}
    
{
  "audioEncoding": enum(AudioEncoding),
  "speakingRate": number,
  "pitch": number,
  "volumeGainDb": number,
  "sampleRateHertz": number,
}
  
## 在bash下使用命令行把生成的txt文件转化为mp3文件  
sed 's|audioContent| |' < synthesize-text.txt > tmp-output.txt && \
tr -d '\n ":{}' < tmp-output.txt > tmp-output-2.txt && \
base64 tmp-output-2.txt --decode > synthesize-text-audio.mp3 && \
rm tmp-output*.txt
