// Next.js API route support: https://nextjs.org/docs/api-routes/introduction




export default function handler(req, res) {
  const tokenId = req.query.tokenId;
  // .tokenId is the parameter that we attach to the end of the url. Had it been named something else like [ok].js, we would have to 
  // write req.query.ok
  const name =`Crypto Dev #${tokenId}`
  const description = "Crypto devs is an NFT collection for web3 developers"
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId)-1}.svg`

  return res.json({
    name:name,
    description:description,
    image: image,
  })
}
