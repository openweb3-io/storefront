    aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 654654375602.dkr.ecr.ap-southeast-1.amazonaws.com
    docker build --no-cache --build-arg NEXT_PUBLIC_STOREFRONT_URL="https://timemarket.openweb3.io"   --build-arg  NEXT_PUBLIC_SALEOR_API_URL="https://timemarket-api.openweb3.io/graphql/" -f Dockerfile -t timemarket/storefront:latest .
    docker tag timemarket/storefront:latest 654654375602.dkr.ecr.ap-southeast-1.amazonaws.com/timemarket/storefront:latest
    docker push 654654375602.dkr.ecr.ap-southeast-1.amazonaws.com/timemarket/storefront:latest


