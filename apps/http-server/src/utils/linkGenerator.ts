export default function generateShareLink(len: number) {
  let options =
    "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let ans = "";
  for (let i = 0; i < len; i++) {
    ans += options[Math.floor(Math.random() * options.length)];
  }
  return ans;
}
