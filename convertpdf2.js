const express = require('express')
const puppeteer = require('puppeteer')
const pdf2base64 = require('pdf-to-base64')
const fs = require('fs')

//Função para fazer uma espera
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

//Função para gerar a string em Base64 do PDF
function gerarBase64(arquivo) {
        
    pdf2base64(arquivo).then((data) => {
        console.log(data)

        /*Criando arquivo txt para teste
        fs.writeFile('teste.txt', 'data:application/pdf;base64,'.concat(data), (err) => {
            if (err) throw err;
            console.log('Arquivo criado')
        })*/

    })
    .catch((error) => {
        console.log(error)
    })

}

//Função para criar o pdf com base na URL
async function gerarPDF(nome, url){

    //Gerando nome completo do arquivo com a extensão .pdf
    const nomeTotalArquivo = nome.concat('.pdf')
    
    //Abrindo navegador
    const browser = await puppeteer.launch()

    //Abrindo nova aba no navegador
    const webPage = await browser.newPage()

    //Indo para a URL e baixando o pdf
    await webPage.goto(url, {
        waitUntil: 'networkidle0'
    })

    // Baixando o PDF
    await webPage.pdf({
        printBackground: true,
        displayHeaderFooter: true,
        path: nomeTotalArquivo,
        format: 'a5',
        landscape: true,
        margin: {
            top: '0px',
            bottom: '0px',
            left: '0px',
            right: '0px'
        }
    }).then(_ => {
        console.log('Arquivo baixado')
    }).catch (e => {
        console.log(e)
    })

    //Fechando o navegador
    await browser.close()
    
    //Chamada função para gerar string base64
    await gerarBase64(nomeTotalArquivo)

    //Deletando aquivo
    fs.unlink(nomeTotalArquivo, err => {
        if (err) {
          throw err
        }
        console.log('Arquivo deletado')
    })

}

//Código normal
gerarPDF('6b050112022', 'https://propostas-hos.bubbleapps.io/version-test/pdf_proposta/1668337987765x716963797284159500')
//gerarPDF('google', 'https://google.com')