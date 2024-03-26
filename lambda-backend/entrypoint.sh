#!/bin/sh

API_NAME=sample-lambda
REGION=us-east-1
STAGE=test
SYSTEM_PROMPT="You are helpful assistant"
API_KEY="your key of Open AI"

function fail() {
    echo $2
    exit $1
}
sleep 3

aws lambda create-function \
    --endpoint-url=http://localstack:4566 \
    --function-name ${API_NAME} \
    --runtime python3.12 \
    --handler lambda_function.lambda_handler \
    --memory-size 128 \
    --zip-file fileb://chat_handler.zip \
    --role arn:aws:iam::084696551378:role/lambda-role \
    --region ${REGION}

[ $? == 0 ] || fail 1 "Failed: AWS / lambda / create-function"

sleep 3
aws lambda update-function-configuration \
    --endpoint-url=http://localstack:4566 \
    --function-name ${API_NAME} \
    --environment "Variables={SYSTEM_PROMPT=\`${SYSTEM_PROMPT}\`,API_KEY=${API_KEY}}" \
    --region ${REGION}

[ $? == 0 ] || fail 2 "Failed: AWS / lambda / create-function"

LAMBDA_ARN=$(aws --endpoint-url=http://localstack:4566 lambda list-functions --query "Functions[?FunctionName==\`${API_NAME}\`].FunctionArn" --output text)

aws --endpoint-url=http://localstack:4566 apigateway create-rest-api \
    --region ${REGION} \
    --name ${API_NAME}

[ $? == 0 ] || fail 3 "Failed: AWS / apigateway / create-rest-api"

API_ID=$(aws --endpoint-url=http://localstack:4566 apigateway get-rest-apis --query "items[?name==\`${API_NAME}\`].id" --output text --region ${REGION})
PARENT_RESOURCE_ID=$(aws --endpoint-url=http://localstack:4566 apigateway get-resources --rest-api-id ${API_ID} --query 'items[?path==`/`].id' --output text --region ${REGION})

aws apigateway create-resource \
    --endpoint-url=http://localstack:4566 \
    --region ${REGION} \
    --rest-api-id ${API_ID} \
    --parent-id ${PARENT_RESOURCE_ID} \
    --path-part "{somethingId}"

[ $? == 0 ] || fail 4 "Failed: AWS / apigateway / create-resource"

RESOURCE_ID=$(aws --endpoint-url=http://localstack:4566 apigateway get-resources --rest-api-id ${API_ID} --query 'items[?path==`/{somethingId}`].id' --output text --region ${REGION})

aws --endpoint-url=http://localstack:4566 apigateway put-method \
    --region ${REGION} \
    --rest-api-id ${API_ID} \
    --resource-id ${RESOURCE_ID} \
    --http-method POST \
    --request-parameters "method.request.path.somethingId=true" \
    --authorization-type "NONE" \

[ $? == 0 ] || fail 5 "Failed: AWS / apigateway / put-method"

aws --endpoint-url=http://localstack:4566 apigateway put-integration \
    --region ${REGION} \
    --rest-api-id ${API_ID} \
    --resource-id ${RESOURCE_ID} \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations \
    --passthrough-behavior WHEN_NO_MATCH \

[ $? == 0 ] || fail 6 "Failed: AWS / apigateway / put-integration"

aws --endpoint-url=http://localstack:4566 apigateway create-deployment \
    --region ${REGION} \
    --rest-api-id ${API_ID} \
    --stage-name ${STAGE} \

[ $? == 0 ] || fail 7 "Failed: AWS / apigateway / create-deployment"

ENDPOINT=http://localhost:4566/restapis/${API_ID}/${STAGE}/_user_request_/test-lambda

echo "API available at: ${ENDPOINT}"
