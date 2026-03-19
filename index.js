import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0'; //todas interfaces de rede possam acessar a nossa aplicação
const porta = 3000; //aplicação identificada pelo número 3000

const app = express();
var listaJogadores = [];


//a sessão deverá ser parametrizada (escolher o comportamento desejado)
app.use(session({
    secret: 'M1nh4Ch4v3S3cr3t4',
    resave: true, //a cada requisição, mesmo que não haja alteração, a sessão será salva
    saveUninitialized: true, //a sessão será criada mesmo que vazio
    cookie: {
        secure: false, //false para desenvolvimento e true para produção (HTTPS)
        httpOnly: true, 
        maxAge: 1000 * 60 * 15 //15 minutos
    }
}));

app.use(cookieParser());

app.use(express.urlencoded({extended: true}));

app.get('/', estaAutenticado, (req, res) => {
    res.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Menu do sistema</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
            </head>
            <body>`);
    res.write(`
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/">Menu</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Cadastro
                            </a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="/jogador">Jogador</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="/listaJogadores">Listar Jogadores</a></li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/logout">Logout</a>
                        </li>
                    </ul>
                    <form class="d-flex" role="search">
                        <input class="form-control me-2" type="search" placeholder="Buscar" aria-label="Buscar"/>
                        <button class="btn btn-outline-success" type="submit">Buscar</button>
                    </form>
                    </div>
                </div>
                </nav>
    `);

    res.write(`
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </html>`);
        
    res.end();
});

//Diferentemente do método GET, que exigia do usuário a passagem de parâmetros por meio da url
//iremos nesta aula utilizar o método POST.
//O método cria um novo recurso no servidor (um registro, uma imagem, um comentário, etc)


//poder enviar dados de um jogador usando um formulário HTML
//A aplicação deverá entregar ou oferecer tal formulário HTML
app.get("/jogador", estaAutenticado, (requisicao, resposta) => {
    //retornar uma página contendo um formulário HTML
    resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Formulário de cadastro de Jogador</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
            </head>
            <body>
                <div class="container mt-5">
                    <form method="POST" action="/jogador" class="row gy-2 gx-3 align-items-center border p-3">
                        <legend>
                            <h3>Cadastro de Jogadores</h3>
                        </legend>

                        <div class="row">
                            <label class="colFormLabel" for="nome">Nome do Jogador</label>
                            <input type="text" class="form-control" id="nome" name="nome">
                        </div>
                        <div class="row">
                            <label class="colFormLabel" for="apelido">Nickname</label>
                            <input type="text" class="form-control" id="apelido" name="apelido">
                        </div>
                        <div class="row">
                            <label class="colFormLabel" for="apelido">Nível do jogador</label>
                            <select class="form-select mb-3" aria-label="seleção de nível do jogador" id="nivel" name="nivel">
                                <option value="" selected>Selecione o nível do jogador</option>
                                <option value="iniciante">Iniciante</option>
                                <option value="experiente">Experiente</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        
                        <div class="row">
                            <button type="submit" class="btn btn-primary">Cadastrar Jogador</button>
                        </div>
                        </form>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </html>
    `);
    resposta.end();
})

//Espera por dados de um formulário html
app.post("/jogador", estaAutenticado, (requisicao, resposta) => {
    //Deve adicionar um novo jogador, criando um  novo estado da aplicação.
    //Usando o método POST o formulário html envia os seus dados no corpo da requisição

    const nome = requisicao.body.nome;
    const apelido = requisicao.body.apelido;
    const nivel = requisicao.body.nivel;

    //impedir que um jogador "vazio" seja cadastrado
    if (!nome || !apelido || !nivel) {
        //mostrar novamente o formulário para o usuário exibindo mensagens de validação.
        let html = `
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Formulário de cadastro de Jogador</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
            </head>
            <body>
                <div class="container mt-5">
                    <form method="POST" action="/jogador" class="row gy-2 gx-3 align-items-center border p-3">
                        <legend>
                            <h3>Cadastro de Jogadores</h3>
                        </legend>

                        <div class="row">
                            <label class="colFormLabel" for="nome">Nome do Jogador</label>
                            <input type="text" class="form-control" id="nome" name="nome" value="${nome}"> `;
                        if (!nome) {
                            html += `
                              <div class="alert alert-danger" role="alert">
                                Por favor informe o nome do jogador
                              </div>
                            `;
                        }
                        html += `
                        </div>
                        <div class="row">
                            <label class="colFormLabel" for="apelido">Nickname</label>
                            <input type="text" class="form-control" id="apelido" name="apelido" value="${apelido}">`;
                        if (!apelido){    
                            html += `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe o apelido/nickname do jogador
                            </div>
                            `;
                        }   
                        html += `
                        </div>
                        <div class="row">
                            <label class="colFormLabel" for="apelido">Nível do jogador</label>
                            <select class="form-select mb-3" aria-label="seleção de nível do jogador" id="nivel" name="nivel">`;
                            if (!nivel){
                                html += `    
                                <option value="" selected>Selecione o nível do jogador</option>
                                `;
                            }
                            else{
                                html += `    
                                <option value="">Selecione o nível do jogador</option>
                                `;
                            }
                            if (nivel== "iniciante"){
                                html += `<option value="iniciante" selected>Iniciante</option>`
                            }
                            else{
                                html += `<option value="iniciante">Iniciante</option>`
                            }
                            if (nivel == "experiente"){
                                html += `<option value="experiente" selected>Experiente</option>`
                            }
                            else{
                                html+= `<option value="experiente">Experiente</option>`
                            }
                            if (nivel == "expert"){
                                html+= `<option value="expert" selected>Expert</option>`
                            }
                            else{
                                html+= `<option value="expert">Expert</option>`
                            }
                            html += `
                            </select> `;
                        if (!nivel){
                            html+= `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe nível do jogador
                            </div>`;
                        }

                        html += `

                        </div>
                        
                        <div class="row">
                            <button type="submit" class="btn btn-primary">Cadastrar Jogador</button>
                        </div>
                    </form>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </html>`;

        resposta.write(html);
        resposta.end();

    }
    else {

        listaJogadores.push(
            {
                "nome": nome,
                "apelido": apelido,
                "nivel": nivel
            }
        );

        resposta.redirect("/listaJogadores");
    }
});

app.get("/listaJogadores", estaAutenticado, (requisicao, resposta) => {
    resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Formulário de cadastro de Jogador</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
            </head>
            <body>
                <div class="container mt-5">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Id</th>
                                <th scope="col">Nome</th>
                                <th scope="col">Apelido</th>
                                <th scope="col">Nível</th>
                            </tr>
                        </thead>
                        <tbody>
    `);
    for(let i = 0; i < listaJogadores.length; i++) {
        const jogador = listaJogadores[i];
        resposta.write(`
            <tr>
                <td>${i+1}</td>
                <td>${jogador.nome}</td>
                <td>${jogador.apelido}</td>
                <td>${jogador.nivel}</td>
            </tr>
        `);
    }
    resposta.write(`    </tbody>
                    </table>
                    <a href="/jogador" class="btn btn-primary">Continuar cadastrando...</a>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </html>`);

    resposta.end();
});

app.get("/login", (requisicao, resposta) => {

    const ultimoAcesso = requisicao.cookies?.ultimoAcesso || "Nunca acessou";

    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br" data-bs-theme="auto"> 
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="description" content="">
                <meta name="author" content="Mark Otto, Jacob Thornton, and Bootstrap contributors">
                <meta name="generator" content="Astro v5.13.2">
                <title>
                    Página de Login
                </title>
                <link rel="canonical" href="https://getbootstrap.com/docs/5.3/examples/sign-in/">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
                <style>
                    .bd-placeholder-img{font-size:1.125rem;text-anchor:middle;-webkit-user-select:none;-moz-user-select:none;user-select:none}@media (min-width: 768px){.bd-placeholder-img-lg{font-size:3.5rem}}.b-example-divider{width:100%;height:3rem;background-color:#0000001a;border:solid rgba(0,0,0,.15);border-width:1px 0;box-shadow:inset 0 .5em 1.5em #0000001a,inset 0 .125em .5em #00000026}.b-example-vr{flex-shrink:0;width:1.5rem;height:100vh}.bi{vertical-align:-.125em;fill:currentColor}.nav-scroller{position:relative;z-index:2;height:2.75rem;overflow-y:hidden}.nav-scroller .nav{display:flex;flex-wrap:nowrap;padding-bottom:1rem;margin-top:-1px;overflow-x:auto;text-align:center;white-space:nowrap;-webkit-overflow-scrolling:touch}.btn-bd-primary{--bd-violet-bg: #712cf9;--bd-violet-rgb: 112.520718, 44.062154, 249.437846;--bs-btn-font-weight: 600;--bs-btn-color: var(--bs-white);--bs-btn-bg: var(--bd-violet-bg);--bs-btn-border-color: var(--bd-violet-bg);--bs-btn-hover-color: var(--bs-white);--bs-btn-hover-bg: #6528e0;--bs-btn-hover-border-color: #6528e0;--bs-btn-focus-shadow-rgb: var(--bd-violet-rgb);--bs-btn-active-color: var(--bs-btn-hover-color);--bs-btn-active-bg: #5a23c8;--bs-btn-active-border-color: #5a23c8}.bd-mode-toggle{z-index:1500}.bd-mode-toggle .bi{width:1em;height:1em}.bd-mode-toggle .dropdown-menu .active .bi{display:block!important}
                </style>
            </head> 
            <body class="d-flex align-items-center py-4 bg-body-tertiary">
                <div class="container w-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="d-none"> <symbol id="check2" viewBox="0 0 16 16"> <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path> </symbol> <symbol id="circle-half" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"></path> </symbol> <symbol id="moon-stars-fill" viewBox="0 0 16 16"> <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path> <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"></path> </symbol> <symbol id="sun-fill" viewBox="0 0 16 16"> <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path> </symbol> </svg> <div class="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle"> <button class="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" aria-label="Toggle theme (auto)"> <svg class="bi my-1 theme-icon-active" aria-hidden="true"><use href="#circle-half"></use></svg> <span class="visually-hidden" id="bd-theme-text">Toggle theme</span> </button> <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text"> <li> <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="light" aria-pressed="false"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#sun-fill"></use></svg>
                        Light
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> <li> <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="dark" aria-pressed="false"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#moon-stars-fill"></use></svg>
                        Dark
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> <li> <button type="button" class="dropdown-item d-flex align-items-center active" data-bs-theme-value="auto" aria-pressed="true"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#circle-half"></use></svg>
                        Auto
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> </ul> </div>  <main class="form-signin w-100 m-auto"> 
                    <form action="/login" method="POST"> 
                        <h1 class="h3 mb-3 fw-normal">Por favor, faça o login</h1> 
                        <div class="form-floating"> 
                            <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com"> 
                            <label for="email">
                                Email 
                            </label> 
                        </div> 
                        <div class="form-floating"> 
                            <input type="password" class="form-control" id="senha" name="senha" placeholder="Password"> 
                            <label for="senha">
                                Senha
                            </label> 
                        </div> 
                        
                        <button class="btn btn-primary w-100 py-2" type="submit">
                            Login
                        </button> `);
    resposta.write(`
                        <p class="mt-5 mb-3 text-body-secondary">Último acesso: ${ultimoAcesso}</p>
    `);
    resposta.write(`
                    </form> 
                </main>   
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </body> 
    </html>
    `);
    resposta.end();
});

app.post("/login",(requisicao, resposta) =>{
    const email = requisicao.body.email;
    const senha = requisicao.body.senha;

    //validação estática
    if (email == "admin@teste.com.br" && senha == "admin") {
        requisicao.session.logado = true; //cria na sessão do usuário a informação de que ele está logado
        //Adicionar um cookie atualizando os dados de último acesso
        const dataUltimoAcesso = new Date();
        resposta.cookie("ultimoAcesso", dataUltimoAcesso.toLocaleString(), {maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true});
        resposta.redirect("/");
    } else {
        resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br" data-bs-theme="auto"> 
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="description" content="">
                <meta name="author" content="Mark Otto, Jacob Thornton, and Bootstrap contributors">
                <meta name="generator" content="Astro v5.13.2">
                <title>
                    Página de Login
                </title>
                <link rel="canonical" href="https://getbootstrap.com/docs/5.3/examples/sign-in/">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
                <style>
                    .bd-placeholder-img{font-size:1.125rem;text-anchor:middle;-webkit-user-select:none;-moz-user-select:none;user-select:none}@media (min-width: 768px){.bd-placeholder-img-lg{font-size:3.5rem}}.b-example-divider{width:100%;height:3rem;background-color:#0000001a;border:solid rgba(0,0,0,.15);border-width:1px 0;box-shadow:inset 0 .5em 1.5em #0000001a,inset 0 .125em .5em #00000026}.b-example-vr{flex-shrink:0;width:1.5rem;height:100vh}.bi{vertical-align:-.125em;fill:currentColor}.nav-scroller{position:relative;z-index:2;height:2.75rem;overflow-y:hidden}.nav-scroller .nav{display:flex;flex-wrap:nowrap;padding-bottom:1rem;margin-top:-1px;overflow-x:auto;text-align:center;white-space:nowrap;-webkit-overflow-scrolling:touch}.btn-bd-primary{--bd-violet-bg: #712cf9;--bd-violet-rgb: 112.520718, 44.062154, 249.437846;--bs-btn-font-weight: 600;--bs-btn-color: var(--bs-white);--bs-btn-bg: var(--bd-violet-bg);--bs-btn-border-color: var(--bd-violet-bg);--bs-btn-hover-color: var(--bs-white);--bs-btn-hover-bg: #6528e0;--bs-btn-hover-border-color: #6528e0;--bs-btn-focus-shadow-rgb: var(--bd-violet-rgb);--bs-btn-active-color: var(--bs-btn-hover-color);--bs-btn-active-bg: #5a23c8;--bs-btn-active-border-color: #5a23c8}.bd-mode-toggle{z-index:1500}.bd-mode-toggle .bi{width:1em;height:1em}.bd-mode-toggle .dropdown-menu .active .bi{display:block!important}
                </style>
            </head> 
            <body class="d-flex align-items-center py-4 bg-body-tertiary">
                <div class="container w-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="d-none"> <symbol id="check2" viewBox="0 0 16 16"> <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path> </symbol> <symbol id="circle-half" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"></path> </symbol> <symbol id="moon-stars-fill" viewBox="0 0 16 16"> <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path> <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"></path> </symbol> <symbol id="sun-fill" viewBox="0 0 16 16"> <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path> </symbol> </svg> <div class="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle"> <button class="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" aria-label="Toggle theme (auto)"> <svg class="bi my-1 theme-icon-active" aria-hidden="true"><use href="#circle-half"></use></svg> <span class="visually-hidden" id="bd-theme-text">Toggle theme</span> </button> <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text"> <li> <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="light" aria-pressed="false"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#sun-fill"></use></svg>
                        Light
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> <li> <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="dark" aria-pressed="false"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#moon-stars-fill"></use></svg>
                        Dark
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> <li> <button type="button" class="dropdown-item d-flex align-items-center active" data-bs-theme-value="auto" aria-pressed="true"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#circle-half"></use></svg>
                        Auto
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> </ul> </div>  <main class="form-signin w-100 m-auto"> 
                    <form action="/login" method="POST"> 
                        <h1 class="h3 mb-3 fw-normal">Por favor, faça o login</h1> 
                        <div class="form-floating"> 
                            <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com"> 
                            <label for="email">
                                Email 
                            </label> 
                        </div> 
                        <div class="form-floating"> 
                            <input type="password" class="form-control" id="senha" name="senha" placeholder="Password"> 
                            <label for="senha">
                                Senha
                            </label> 
                        </div> 
                        <span>
                            <p class="text-danger">Email ou senha inválidos!</p>
                        </span>
                        <button class="btn btn-primary w-100 py-2" type="submit">
                            Login
                        </button> 
                    </form> 
                </main>   
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </body> 
    </html>
    `);
    resposta.end();
    }


});

app.get("/logout", (requisicao, resposta) => {
    requisicao.session.destroy();
    resposta.redirect("/login");    
});


//Middleware
function estaAutenticado(requisicao, resposta, proximo) {
    if (requisicao.session?.logado){
        proximo();
    }
    else{
        resposta.redirect("/login");
    }
}

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
})