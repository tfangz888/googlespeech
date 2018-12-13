
https://cloud.google.com/sdk/docs/quickstart-linux  
# install google cloud sdk
cd /tmp/aaa/; gcloud init --console-only  
其它命令：  
gcloud init --console-only  
gcloud config list  
gcloud info  

# 两类帐户皆可以使用SDK：  
1. user account  
2. service account  
1. gcloud auth list; gcloud auth login --no-launch-browser 登录user account  
2. 建立service帐户： gcloud iam service-accounts list  
显示  
NAME    EMAIL  
speech  speech@speechwavenet.iam.gserviceaccount.com  
设置环境变量  
gcloud iam service-accounts keys create key.json --iam-account speech@speechwavenet.iam.gserviceaccount.com  
GOOGLE_APPLICATION_CREDENTIALS='key.json'  

# python speech例子  
https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/texttospeech/cloud-client  
git clone https://github.com/GoogleCloudPlatform/python-docs-samples.git  
virtualenv env  
source env/bin/activate  
pip install -r requirements.txt  

