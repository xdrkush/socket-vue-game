# Oublie pas de changer le .env du front pour l'url socket.io

# $1 = user server ssh
# $2 = ip server ssh
# $3 = port ssh server

cd front && yarn build && cd ..;
mv front/dist back/;
rm -r back/node_modules;
scp -r -P $3 ./back $1@$2: ;

rm -r back/dist;

cd back && yarn;