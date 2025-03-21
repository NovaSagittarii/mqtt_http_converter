# assumes conv is already built
docker compose rm -f
docker compose up -d 2> /dev/null

cd ../test
npm start
cd -

docker compose down 2> /dev/null
