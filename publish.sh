yarn && yarn build
rm -r interfaces
rm NodaryDataFeedIdDeriver.sol
cp -r contracts/interfaces interfaces
cp -r contracts/NodaryDataFeedIdDeriver.sol NodaryDataFeedIdDeriver.sol
yarn version
yarn publish --access public
git push --follow-tags