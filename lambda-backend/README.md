Instructions test Lambda Locally.

The docker compose for this file is special for running Lambdas.

If you want to try with docker compose. I will required to substitute the env variables with the corresponding secrets.

cd chat_handler

pip install -r requirements.txt --platform manylinux2014_x86_64 --target . --only-binary=:all:

Zip contents of folder. (Not the folder). Name it: chat_handler.zip

Run 
docker compose up --build

Check logs and gather endpoint URL

Test using Curl or postman

To adjust it to Lambda 

I opted for the easiest way which is loading zip in lambda, but docker file is also fine

Run:

```bash
pip install -r requirements.txt --platform manylinux2014_x86_64 --target . --only-binary=:all:
```

Zip contents of chat_handler folder. (Not the folder). Name it: chat_handler.zip

Once zip is created, it will be used in the lambda function of AWS.

