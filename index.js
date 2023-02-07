const puppeteer = require("puppeteer");
const pdf2base64 = require("pdf-to-base64");
const fs = require('fs');

const express = require("express");
const server = express();

//Função para fazer uma espera
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

//Função para criar o pdf com base na URL
async function gerarPdfArquivo(url, nomeCompletoArquivo) {
    //Abrindo navegador
    const browser = await puppeteer.launch();

    //Abrindo nova aba no navegador
    const webPage = await browser.newPage();

    //Indo para a URL e esperando carregamento total
    await webPage.goto(url, {
        waitUntil: "networkidle0",
    });

    // Baixando e formatando o PDF
    await webPage.pdf({
        printBackground: true,
        displayHeaderFooter: true,
        path: nomeCompletoArquivo,
        format: "a5",
        landscape: true,
        margin: {
            top: "0px",
            bottom: "0px",
            left: "0px",
            right: "0px",
        },
    });

    //Fechando o navegador
    await webPage.close();

    //Gerando string base64
    return pdf2base64(nomeCompletoArquivo)
        .then((data) => {
            //| console log apenas para confirmar que foi efetuado com sucesso
            console.log("Download realizado com sucesso.");

            // Excluindo arquivo
            fs.unlink(nomeCompletoArquivo, function (err){
                if (err) throw err;
                console.log('Arquivo deletado!');
            });

            //| retorno a base64 em string
            return data;
        })
        .catch((error) => console.log(error));
}

// INICIO DAS ROTAS
server.get("/", (req, res) => {
    return res.json({ mensagem: "API está funcionando" });
});

//| adicionei async na resposta
server.get("/gerarpdf/:url(*)", async (req, res) => {
    //| logo no console o que esta acontecendo no código
    console.log("Chamada para download da página: " + req.params.url);

    //Gerando nome completo do arquivo com a extensão .pdf
    //| alterei o local pois dai na resposta da chamada consigo retornar o nome do mesmo antes do download
    const nomeCompletoArquivo = Math.random()
        .toString(36)
        .substring(4)
        .concat(".pdf");

    //| gero o arquivo PDF, com os parâmetros informados
    //| adicionei o await na função
    const base64 = await gerarPdfArquivo(req.params.url, nomeCompletoArquivo);

    //| retorno na chamada a url que será realizado o download e o nome do arquivo que será gerado e a base64 assim que retornada pela função acima
    return res.json({
        url_informada: req.params.url,
        nome_arquivo: nomeCompletoArquivo,
        base64: base64,
    });
});

server.listen(3000, () => {
    console.log("Servidor iniciado com sucesso: 3000");
});