export function lzw_decode(s: string): string
{
    const dict = new Map(); // Use a Map!
    const data = Array.from(s + "");
    let currChar = data[0];
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase;
    let currCode;
    let cp;
    for (let i = 1; i < data.length; i++)
    {
        currCode = data[i].codePointAt(0);
        if (currCode < 256)
        {
            phrase = data[i];
        }
        else
        {
            phrase = dict.has(currCode) ? dict.get(currCode) : (oldPhrase + currChar);
        }
        out.push(phrase);
        cp = phrase.codePointAt(0);
        currChar = String.fromCodePoint(cp); //phrase.charAt(0);
        dict.set(code, oldPhrase + currChar);
        code++;
        if (code === 0xd800) { code = 0xe000; }
        oldPhrase = phrase;
    }
    return out.join("");
};