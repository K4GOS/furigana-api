import express from "express";
import kuromoji from "kuromoji";

const app = express();

const PORT = process.env.PORT || 8000;

const katakanaToHiragana = (h) => {
  let res = "";
  for (let i = 0; i < h.length; i++) {
    const hir = h[i];
    const katakanaConversion = "あ".charCodeAt(0) - "ア".charCodeAt(0);
    res += String.fromCharCode(hir.charCodeAt(0) + katakanaConversion);
  }
  return res;
};

const getGrammarType = (node) => {
  return node.pos_detail_1 === "固有名詞" ? node.pos_detail_1 : node.pos;
}

app.get("/", (req, res) => res.send("Hello World ! How are you ?"));

app.get("/furigana/:content", (req, res) => {
  const content = req.params.content;
  kuromoji.builder({ dicPath: "dict" }).build(function (err, tokenizer) {
    const nodes = tokenizer.tokenize(content);
    const finalRes = nodes.map((node) =>
      node.surface_form.match(/[一-龯]/g)
        ? {
            word: node.surface_form,
            reading: katakanaToHiragana(node.reading),
            grammarType: getGrammarType(node),
          }
        : { word: node.surface_form, grammarType: getGrammarType(node) }
    );
    res.json(finalRes);
  });
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
