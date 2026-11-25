// Aguarda o carregamento completo do HTML antes de executar o JavaScript.
// Isso garante que os elementos da página já existam quando forem acessados.
document.addEventListener('DOMContentLoaded', function () {

    // URL base da API do backend.
    // Vem da variável SERVIDOR_DW3 do arquivo .env do front-end,
    // entregue pelo servidor Express no atributo data-servidor-dw3 do <body>.
    // O valor após || é apenas um reserva caso a variável não exista.
    const API = document.body.dataset.servidorDw3 || 'http://localhost:40001';

    // Nome da chave utilizada para armazenar o token de autenticação.
    const tokenKey = 'erpPastejoToken';

    // Nome da chave utilizada para armazenar o nome do usuário logado.
    const userKey = 'erpPastejoUser';

    // Obtém o formulário de login existente no HTML.
    const loginForm = document.getElementById('formLogin');

    // Obtém o modal responsável por exibir a tela de login.
    const loginModal = document.getElementById('modalLogin');

    // Referência ao elemento body da página.
    const body = document.body;


    /* =====================================
       CONTROLE DE ACESSO
    ===================================== */

    // Bloqueia o acesso à aplicação e exibe o modal de login.
    function bloquearAplicacao() {
        body.classList.add('auth-locked');
        loginModal.classList.add('show');
    }

    // Libera o acesso à aplicação após autenticação.
    function liberarAplicacao() {
        body.classList.remove('auth-locked');
        loginModal.classList.remove('show');
    }


    /* =====================================
       ELEMENTOS DE NAVEGAÇÃO
    ===================================== */

    // Seleciona todas as páginas do sistema.
    const paginas = document.querySelectorAll('.page');

    // Seleciona os links do menu lateral.
    const links = document.querySelectorAll('.menu-link');

    // Seleciona os botões que levam aos módulos do sistema.
    const botoesModulo = document.querySelectorAll('.module-item');

    // Obtém a barra lateral de navegação.
    const sidebar = document.getElementById('sidebar');


    /* =====================================
       NAVEGAÇÃO ENTRE PÁGINAS
    ===================================== */

    // Função global utilizada para abrir uma página específica do ERP.
    window.abrirPagina = function (pagina) {

        // Remove a classe active de todas as páginas.
        // Assim, nenhuma página permanece visível antes de abrir a escolhida.
        paginas.forEach(p => p.classList.remove('active'));

        // Busca a página correspondente ao nome recebido.
        const elemento = document.getElementById(pagina);

        // Se a página existir, adiciona a classe active para exibi-la.
        if (elemento) {
            elemento.classList.add('active');
        }

        // Atualiza os links do menu.
        // O link correspondente à página aberta recebe a classe active.
        links.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pagina);
        });

        // Busca o link referente à página atualmente selecionada.
        const linkAtivo = document.querySelector(
            '.menu-link[data-page="' + pagina + '"]'
        );

        // Atualiza o título principal da página.
        // Se não encontrar o link, utiliza o nome da página recebido.
        document.getElementById('pageTitle').textContent =
            linkAtivo ? linkAtivo.textContent.trim() : pagina;

        // Fecha o menu lateral após a navegação.
        sidebar.classList.remove('open');

        // Verifica qual módulo foi aberto e carrega seus dados.
        if (pagina === 'pasto') carregarPastos();
        if (pagina === 'piquete') carregarPiquetes();
        if (pagina === 'animal') carregarAnimais();
        if (pagina === 'alocado') carregarAlocados();
    };


    // Adiciona um evento de clique a cada link do menu lateral.
    links.forEach(link => {

        // Executa a função quando o usuário clicar no link.
        link.addEventListener('click', function (e) {

            // Impede o comportamento padrão do link HTML.
            e.preventDefault();

            // Abre a página indicada pelo atributo data-page.
            abrirPagina(link.dataset.page);
        });
    });


    // Adiciona eventos de clique aos botões dos módulos.
    botoesModulo.forEach(button => {

        // Quando um botão for clicado, abre o módulo correspondente.
        button.addEventListener('click', function () {
            abrirPagina(button.dataset.page);
        });
    });


    // Controla a abertura e o fechamento do menu lateral.
    document.getElementById('menuToggle').addEventListener('click', function () {

        // Alterna a classe open.
        // Se o menu estiver fechado, abre; se estiver aberto, fecha.
        sidebar.classList.toggle('open');
    });


    /* =====================================
       LOGIN E SESSÃO DO USUÁRIO
    ===================================== */

    // Atualiza as informações visuais do usuário logado.
    function atualizarUsuario() {

        // Recupera o nome armazenado na sessão.
        // Caso não exista, utiliza "Usuário".
        const user = sessionStorage.getItem(userKey) || 'Usuário';

        // Seleciona o elemento que exibe o nome do usuário.
        const userLabel = document.querySelector('.user-info span');

        // Seleciona o elemento que exibe o avatar.
        const avatar = document.querySelector('.user-avatar');

        // Atualiza o nome do usuário, caso o elemento exista.
        if (userLabel) userLabel.textContent = user;

        // Exibe a primeira letra do nome no avatar.
        if (avatar) avatar.textContent = user.charAt(0).toUpperCase();
    }


    // Verifica se o formulário de login existe na página.
    if (loginForm) {

        // Registra o evento de envio do formulário.
        loginForm.addEventListener('submit', async function (e) {

            // Impede o recarregamento da página ao enviar o formulário.
            e.preventDefault();

            // Obtém o nome de usuário digitado e remove espaços extras.
            const username = document.getElementById('username').value.trim();

            // Obtém a senha digitada pelo usuário.
            const password = document.getElementById('password').value;

            // Obtém o botão de envio do formulário.
            const button = loginForm.querySelector('button[type="submit"]');

            // Desabilita o botão para evitar vários envios simultâneos.
            if (button) button.disabled = true;

            try {

                // Envia os dados de login para o endpoint da API.
                const result = await requisicao(`${API}/Login`, {

                    // Define o método HTTP utilizado.
                    method: 'POST',

                    // Informa que os dados serão enviados em formato JSON.
                    headers: {
                        'Content-Type': 'application/json'
                    },

                    // Converte o nome de usuário e senha para JSON.
                    body: JSON.stringify({ username, password })
                });

                // Verifica se o backend retornou um token de autenticação.
                if (!result?.token) {
                    throw new Error('Token não recebido pelo servidor.');
                }

                // Armazena o token na sessão do navegador.
                // Ele será utilizado nas próximas requisições autenticadas.
                sessionStorage.setItem(tokenKey, result.token);

                // Armazena o nome do usuário na sessão.
                // Se o backend não retornar o username, utiliza o digitado.
                sessionStorage.setItem(
                    userKey,
                    result.usuario?.username || username
                );

                // Libera o acesso ao sistema após o login.
                liberarAplicacao();

                // Limpa os campos do formulário.
                loginForm.reset();

                // Atualiza o nome e avatar do usuário.
                atualizarUsuario();

                // Atualiza os números exibidos no dashboard.
                carregarResumo();

            } catch (err) {

                // Exibe a mensagem caso o login falhe.
                alert(err.message || 'Falha no login.');

            } finally {

                // Reativa o botão, independentemente do resultado do login.
                if (button) button.disabled = false;
            }
        });
    }


    /* =====================================
       FUNÇÕES DE ACESSO À API (CRUD)
       Uma função para cada API do back-end:
       GetAll, GetByID, Insert, Update e Delete
       de Pasto, Piquete, Animal e Alocado.
    ===================================== */

    // ---------- PASTO ----------

    // GetAllPasto: retorna todos os registros não removidos.
    async function getAllPasto() {
        return requisicao(`${API}/getAllPasto`);
    }

    // GetPastoByID: retorna um registro pelo ID.
    async function getPastoByID(id) {
        return requisicao(`${API}/getPastoByID/${id}`);
    }

    // InsertPasto: cadastra um novo registro (POST).
    async function insertPasto(dados) {
        return requisicao(`${API}/insertPasto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }

    // UpdatePasto: atualiza um registro pelo ID (PUT).
    async function updatePasto(id, dados) {
        return requisicao(`${API}/updatePasto/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }

    // DeletePasto: remoção lógica (soft delete) pelo ID (DELETE).
    async function deletePasto(id) {
        return requisicao(`${API}/deletePasto/${id}`, {
            method: 'DELETE'
        });
    }

    // ---------- PIQUETE ----------

    // GetAllPiquete: retorna todos os registros não removidos.
    async function getAllPiquete() {
        return requisicao(`${API}/getAllPiquete`);
    }

    // GetPiqueteByID: retorna um registro pelo ID.
    async function getPiqueteByID(id) {
        return requisicao(`${API}/getPiqueteByID/${id}`);
    }

    // InsertPiquete: cadastra um novo registro (POST).
    async function insertPiquete(dados) {
        return requisicao(`${API}/insertPiquete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }

    // UpdatePiquete: atualiza um registro pelo ID (PUT).
    async function updatePiquete(id, dados) {
        return requisicao(`${API}/updatePiquete/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }

    // DeletePiquete: remoção lógica (soft delete) pelo ID (DELETE).
    async function deletePiquete(id) {
        return requisicao(`${API}/deletePiquete/${id}`, {
            method: 'DELETE'
        });
    }

    // ---------- ANIMAL ----------

    // GetAllAnimal: retorna todos os registros não removidos.
    async function getAllAnimal() {
        return requisicao(`${API}/getAllAnimal`);
    }

    // GetAnimalByID: retorna um registro pelo ID.
    async function getAnimalByID(id) {
        return requisicao(`${API}/getAnimalByID/${id}`);
    }

    // InsertAnimal: cadastra um novo registro (POST).
    async function insertAnimal(dados) {
        return requisicao(`${API}/insertAnimal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }

    // UpdateAnimal: atualiza um registro pelo ID (PUT).
    async function updateAnimal(id, dados) {
        return requisicao(`${API}/updateAnimal/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }

    // DeleteAnimal: remoção lógica (soft delete) pelo ID (DELETE).
    async function deleteAnimal(id) {
        return requisicao(`${API}/deleteAnimal/${id}`, {
            method: 'DELETE'
        });
    }

    // ---------- ALOCADO ----------

    // GetAllAlocado: retorna todos os registros não removidos.
    async function getAllAlocado() {
        return requisicao(`${API}/getAllAlocado`);
    }

    // GetAlocadoByID: retorna um registro pelo ID.
    async function getAlocadoByID(id) {
        return requisicao(`${API}/getAlocadoByID/${id}`);
    }

    // InsertAlocado: cadastra um novo registro (POST).
    async function insertAlocado(dados) {
        return requisicao(`${API}/insertAlocado`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }

    // UpdateAlocado: atualiza um registro pelo ID (PUT).
    async function updateAlocado(id, dados) {
        return requisicao(`${API}/updateAlocado/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }

    // DeleteAlocado: remoção lógica (soft delete) pelo ID (DELETE).
    async function deleteAlocado(id) {
        return requisicao(`${API}/deleteAlocado/${id}`, {
            method: 'DELETE'
        });
    }


    /* =====================================
       DASHBOARD
    ===================================== */

    // Carrega os totais dos módulos no painel principal.
    async function carregarResumo() {

        // Verifica se existe token de autenticação.
        // Sem token, não realiza requisições.
        if (!sessionStorage.getItem(tokenKey)) return;

        // Funções GetAll de cada módulo.
        const getAll = {
            pasto: getAllPasto,
            piquete: getAllPiquete,
            animal: getAllAnimal,
            alocado: getAllAlocado
        };

        // Define os módulos e os IDs dos elementos
        // onde seus respectivos totais serão exibidos.
        const endpoints = [
            ['pasto', 'totalPastos'],
            ['piquete', 'totalPiquetes'],
            ['animal', 'totalAnimais'],
            ['alocado', 'totalAlocados']
        ];

        // Percorre todos os módulos e solicita seus dados.
        await Promise.all(endpoints.map(async ([modulo, id]) => {

            try {

                // Faz uma requisição ao endpoint do módulo.
                const data = await getAll[modulo]();

                // Obtém a lista de registros e atualiza o contador.
                document.getElementById(id).textContent =
                    lista(data, `${modulo}s`).length;

            } catch {

                // Se houver erro, exibe um traço no contador.
                document.getElementById(id).textContent = '—';
            }
        }));
    }


    /* =====================================
       VALIDAÇÃO DA SESSÃO
    ===================================== */

    // Bloqueia inicialmente o sistema.
    // O acesso será liberado somente após validar a sessão.
    bloquearAplicacao();


    // Verifica se o usuário já possui uma sessão armazenada.
    async function validarSessaoInicial() {

        // Recupera o token armazenado no navegador.
        const token = sessionStorage.getItem(tokenKey);

        // Se não houver token, mantém a tela de login.
        if (!token) return;

        try {

            // Faz uma requisição protegida para verificar se o token é válido.
            await getAllPasto();

            // Se a requisição funcionar, libera a aplicação.
            liberarAplicacao();

            // Atualiza as informações do usuário.
            atualizarUsuario();

            // Atualiza os totais do dashboard.
            carregarResumo();

        } catch (e) {

            // Se a sessão for inválida, remove os dados armazenados.
            sessionStorage.removeItem(tokenKey);
            sessionStorage.removeItem(userKey);

            // Bloqueia novamente o sistema e exibe o login.
            bloquearAplicacao();
        }
    }

    // Executa a verificação da sessão ao iniciar o sistema.
    validarSessaoInicial();


    /* =====================================
       LOGOUT
    ===================================== */

    // Obtém o botão responsável por encerrar a sessão.
    const logoutButton = document.getElementById('logoutButton');

    // Verifica se o botão existe.
    if (logoutButton) {

        // Registra o evento de clique no botão de saída.
        logoutButton.addEventListener('click', function () {

            // Solicita confirmação antes de encerrar a sessão.
            if (!confirm('Deseja realmente sair do sistema?')) return;

            // Avisa o back-end (Logout). Se falhar, o logout local continua.
            requisicao(`${API}/Logout`, { method: 'POST' }).catch(function () {});

            // Remove o token de autenticação.
            sessionStorage.removeItem(tokenKey);

            // Remove o nome do usuário armazenado.
            sessionStorage.removeItem(userKey);

            // Bloqueia novamente o sistema.
            bloquearAplicacao();

            // Atualiza os dados visuais do usuário.
            atualizarUsuario();

            // Retorna à página inicial.
            abrirPagina('dashboard');
        });
    }


    /* =====================================
       UTILITÁRIOS
    ===================================== */

    // Função global utilizada para fechar modais.
    window.fecharModal = function (id) {

        // Remove a classe show do modal informado.
        // Isso faz com que ele deixe de ser exibido.
        document.getElementById(id).classList.remove('show');
    };


    // Função utilizada internamente para abrir modais.
    function abrirModal(id) {

        // Adiciona a classe show ao modal.
        // A classe é responsável pela exibição através do CSS.
        document.getElementById(id).classList.add('show');
    }


    // Protege os textos inseridos no HTML contra interpretação de tags.
    function escapar(valor) {

        // Converte o valor para texto.
        // Depois substitui caracteres especiais por entidades HTML.
        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    /* =====================================
       VALIDAÇÃO VISUAL DOS CAMPOS
    ===================================== */

    // Exibe uma mensagem de validação diretamente no campo.
    function mostrarValidacao(campo, mensagem) {

        // Define a mensagem personalizada de validação.
        campo.setCustomValidity(mensagem);

        // Solicita ao navegador que exiba a mensagem junto ao campo.
        campo.reportValidity();

        // Adiciona um evento para limpar a mensagem
        // quando o usuário começar a corrigir o campo.
        campo.addEventListener('input', function limparValidacao() {

            // Remove a mensagem personalizada.
            campo.setCustomValidity('');

            // Remove o próprio evento após utilizá-lo.
            campo.removeEventListener('input', limparValidacao);
        });
    }


    /* =====================================
       REQUISIÇÕES AO BACKEND
    ===================================== */

    // Função responsável por realizar as requisições HTTP à API.
    async function requisicao(url, options = {}) {

        // Copia os cabeçalhos recebidos.
        const headers = { ...(options.headers || {}) };

        // Recupera o token armazenado na sessão.
        const token = sessionStorage.getItem(tokenKey);

        // Se houver token, adiciona-o ao cabeçalho Authorization.
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // Envia a requisição para o servidor.
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Obtém o conteúdo da resposta como texto.
        const texto = await response.text();

        // Variável que armazenará a resposta processada.
        let data = null;

        // Tenta converter o texto da resposta para JSON.
        try {
            data = texto ? JSON.parse(texto) : null;
        } catch {

            // Se não for JSON válido, mantém o conteúdo como texto.
            data = texto;
        }

        // Verifica se a resposta HTTP indica erro.
        if (!response.ok) {

            // Se o servidor indicar falta de autorização,
            // remove os dados da sessão e bloqueia o sistema.
            if (response.status === 401 && url !== `${API}/Login`) {
                sessionStorage.removeItem(tokenKey);
                sessionStorage.removeItem(userKey);
                bloquearAplicacao();
            }

            // Cria um erro utilizando a mensagem retornada pelo backend.
            throw new Error(
                data?.erro ||
                data?.message ||
                data?.mensagem ||
                'Erro na requisição.'
            );
        }

        // O back-end responde { status: 'ok' | mensagem de erro, linhasAfetadas }
        // nas operações de Insert, Update e Delete (padrão da disciplina).
        if (data && typeof data === 'object' && typeof data.status === 'string' && data.status !== 'ok') {
            throw new Error(data.status);
        }

        // Nenhuma linha afetada: o registro não existe ou já foi removido.
        if (data && typeof data === 'object' && data.linhasAfetadas === 0) {
            throw new Error('Registro não encontrado.');
        }

        // Retorna os dados recebidos quando a requisição é bem-sucedida.
        return data;
    }


    /* =====================================
       REGISTRO ÚNICO (GetXXXByID)
    ===================================== */

    // O back-end responde { status: 'ok', registro: [ {...} ] }.
    // Esta função devolve o primeiro (e único) registro.
    function primeiroRegistro(data) {
        const registro = Array.isArray(data?.registro) ? data.registro[0] : data;

        if (!registro) throw new Error('Registro não encontrado.');

        return registro;
    }


    /* =====================================
       TRATAMENTO DE LISTAS
    ===================================== */

    // Obtém uma lista de registros de diferentes formatos de resposta.
    function lista(data, chave) {

        // Se a resposta já for um array, retorna diretamente.
        if (Array.isArray(data)) return data;

        // Verifica se a resposta possui um array na chave informada.
        if (Array.isArray(data?.[chave])) return data[chave];

        // Formato usado nas aulas: { status: 'ok', registro: [...] }.
        if (Array.isArray(data?.registro)) return data.registro;

        // Verifica se os dados estão dentro da propriedade data.
        if (Array.isArray(data?.data)) return data.data;

        // Verifica se os dados estão dentro da propriedade dados.
        if (Array.isArray(data?.dados)) return data.dados;

        // Se nenhum formato for encontrado, retorna uma lista vazia.
        return [];
    }


    /* =====================================
       MENSAGENS NAS TABELAS
    ===================================== */

    // Exibe uma mensagem dentro de uma tabela.
    function mensagemTabela(elemento, mensagem, colunas = 4) {

        // Insere uma linha ocupando todas as colunas da tabela.
        elemento.innerHTML = `
            <tr>
                <td colspan="${colunas}" class="table-message">
                    ${escapar(mensagem)}
                </td>
            </tr>
        `;
    }


    /* =====================================
       CONFIRMAÇÃO DE EXCLUSÃO
    ===================================== */

    // Solicita confirmação do usuário antes de excluir um registro.
    function confirmarExclusao() {

        // Retorna true se o usuário confirmar
        // ou false se cancelar.
        return confirm('Deseja realmente excluir este registro?');
    }


    /* =====================================
       PASTOS
    ===================================== */

    // Obtém o corpo da tabela de Pastos.
    const tabelaPastos = document.getElementById('tabelaPastos');

    // Obtém o formulário de cadastro e edição de Pastos.
    const formPasto = document.getElementById('formPasto');


    /* =====================================
       LISTAR PASTOS
    ===================================== */

    // Função global que carrega os Pastos cadastrados.
    window.carregarPastos = async function () {

        try {

            // Solicita os dados de Pastos ao backend.
            const data = await getAllPasto();

            // Extrai a lista de Pastos da resposta.
            const pastos = lista(data, 'pastos');

            // Cria uma linha da tabela para cada Pasto.
            tabelaPastos.innerHTML = pastos.map(p => `
                <tr>
                    <td>${escapar(p.pastoid)}</td>
                    <td>${escapar(p.descricao)}</td>
                    <td>${escapar(p.areatotal)}</td>
                    <td>
                        <button class="btn-action edit"
                            onclick="editarPasto(${Number(p.pastoid)})">
                            Editar
                        </button>

                        <button class="btn-action delete"
                            onclick="excluirPasto(${Number(p.pastoid)})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `).join('');

            // Se não houver Pastos cadastrados,
            // exibe uma mensagem na tabela.
            if (!pastos.length) {
                mensagemTabela(tabelaPastos, 'Nenhum pasto cadastrado.');
            }

            // Atualiza o contador de Pastos no dashboard.
            document.getElementById('totalPastos').textContent =
                pastos.length;

        } catch (e) {

            // Se ocorrer erro, exibe a mensagem na tabela.
            mensagemTabela(tabelaPastos, e.message);
        }
    };


    /* =====================================
       NOVO PASTO
    ===================================== */

    // Prepara o formulário para cadastrar um novo Pasto.
    window.novoPasto = function () {

        // Limpa todos os campos do formulário.
        formPasto.reset();

        // Limpa o ID, indicando que se trata de um novo registro.
        document.getElementById('pastoid').value = '';

        // Atualiza o título do modal.
        document.getElementById('tituloPasto').textContent = 'Novo pasto';

        // Abre o modal de cadastro.
        abrirModal('modalPasto');
    };


    /* =====================================
       EDITAR PASTO
    ===================================== */

    // Busca um Pasto pelo ID e preenche o formulário.
    window.editarPasto = async function (id) {

        try {

            // Solicita os dados do Pasto específico ao backend.
            const data = await getPastoByID(id);

            // Obtém o objeto Pasto da resposta.
            const p = primeiroRegistro(data);

            // Preenche o campo oculto com o ID do registro.
            document.getElementById('pastoid').value = p.pastoid;

            // Preenche o campo de descrição.
            document.getElementById('descricaoPasto').value = p.descricao;

            // Preenche o campo de área total.
            document.getElementById('areaPasto').value = p.areatotal;

            // Altera o título do modal para edição.
            document.getElementById('tituloPasto').textContent = 'Editar pasto';

            // Abre o modal de edição.
            abrirModal('modalPasto');

        } catch (e) {

            // Exibe a mensagem caso a consulta falhe.
            alert(e.message);
        }
    };


    /* =====================================
       EXCLUIR PASTO
    ===================================== */

    // Exclui um Pasto pelo ID.
    window.excluirPasto = async function (id) {

        // Verifica se o usuário confirmou a exclusão.
        if (!confirmarExclusao()) return;

        try {

            // Envia a requisição DELETE ao backend.
            await deletePasto(id);

            // Atualiza a tabela após a exclusão.
            carregarPastos();

        } catch (e) {

            // Exibe o erro caso a exclusão não seja concluída.
            alert(e.message);
        }
    };


    /* =====================================
       SALVAR PASTO
    ===================================== */

    // Registra o evento de envio do formulário de Pastos.
    formPasto.addEventListener('submit', async function (e) {

        // Impede o comportamento padrão do formulário.
        e.preventDefault();

        // Obtém o ID do registro.
        // Se estiver vazio, significa que será um cadastro.
        // Se possuir valor, significa que será uma edição.
        const id = document.getElementById('pastoid').value;

        // Monta o objeto com os dados do formulário.
        const dados = {
            descricao: document.getElementById('descricaoPasto').value,

            // Converte o valor da área para número.
            areatotal: Number(document.getElementById('areaPasto').value)
        };

        try {

            // Define a URL e o método HTTP de acordo com a operação.
            // Se existir ID, atualiza (UpdateX). Se não existir, cadastra (InsertX).
            if (id) {
                await updatePasto(id, dados);
            } else {
                await insertPasto(dados);
            }

            // Fecha o modal após salvar com sucesso.
            fecharModal('modalPasto');

            // Atualiza a tabela de Pastos.
            carregarPastos();

        } catch (e) {

            // Exibe a mensagem se o backend retornar um erro.
            alert(e.message);
        }
    });
    /* =====================================
       PIQUETES
    ===================================== */

    // Obtém o corpo da tabela onde os piquetes serão exibidos.
    const tabelaPiquetes = document.getElementById('tabelaPiquetes');

    // Obtém o formulário utilizado para cadastrar e editar piquetes.
    const formPiquete = document.getElementById('formPiquete');


    /* =====================================
       LISTAR PIQUETES
    ===================================== */

    // Cria uma função global para carregar os piquetes cadastrados.
    window.carregarPiquetes = async function () {

        try {

            // Solicita simultaneamente os piquetes e os pastos à API.
            // Promise.all permite executar as duas requisições ao mesmo tempo.
            const [data, pastosData] = await Promise.all([
                getAllPiquete(),
                getAllPasto()
            ]);

            // Extrai a lista de piquetes da resposta da API.
            const piquetes = lista(data, 'piquetes');

            // Extrai a lista de pastos da resposta da API.
            const pastos = lista(pastosData, 'pastos');


            // Percorre os piquetes e cria uma linha HTML para cada registro.
            tabelaPiquetes.innerHTML = piquetes.map(p => `
                <tr>

                    <!-- Exibe o identificador do piquete. -->
                    <td>${escapar(p.piqueteid)}</td>

                    <!-- Exibe a descrição do piquete. -->
                    <td>${escapar(p.descricao)}</td>

                    <!-- Exibe o identificador do pasto associado. -->
                    <td>${escapar(p.pastodescricao)}</td>

                    <!-- Exibe a latitude do piquete. -->
                    <td>${escapar(p.latitude)}</td>

                    <!-- Exibe a longitude do piquete. -->
                    <td>${escapar(p.longitude)}</td>

                    <td>

                        <!-- Botão que chama a função de edição
                             passando o ID do piquete. -->
                        <button class="btn-action edit"
                            onclick="editarPiquete(${Number(p.piqueteid)})">
                            Editar
                        </button>

                        <!-- Botão que chama a função de exclusão
                             passando o ID do piquete. -->
                        <button class="btn-action delete"
                            onclick="excluirPiquete(${Number(p.piqueteid)})">
                            Excluir
                        </button>

                    </td>
                </tr>
            `).join('');


            // Verifica se não existem piquetes cadastrados.
            // Caso a lista esteja vazia, mostra uma mensagem na tabela.
            if (!piquetes.length) {
                mensagemTabela(
                    tabelaPiquetes,
                    'Nenhum piquete cadastrado.',
                    6
                );
            }


            // Atualiza o total de piquetes exibido no dashboard.
            document.getElementById('totalPiquetes').textContent =
                piquetes.length;


            // Preenche o campo de seleção de Pastos.
            // O usuário poderá escolher a qual pasto o piquete pertence.
            document.getElementById('pastofk').innerHTML =
                pastos.map(p => `
                    <option value="${escapar(p.pastoid)}">
                        ${escapar(p.descricao)}
                    </option>
                `).join('');


        } catch (e) {

            // Se ocorrer um erro na requisição,
            // exibe a mensagem dentro da tabela de piquetes.
            mensagemTabela(tabelaPiquetes, e.message, 6);
        }
    };


    /* =====================================
       NOVO PIQUETE
    ===================================== */

    // Prepara o formulário para cadastrar um novo piquete.
    window.novoPiquete = function () {

        // Limpa os campos do formulário.
        formPiquete.reset();

        // Limpa o ID.
        // Sem ID, o sistema entende que é um novo cadastro.
        document.getElementById('piqueteid').value = '';

        // Define o título do modal.
        document.getElementById('tituloPiquete').textContent =
            'Novo piquete';

        // Abre o modal de cadastro.
        abrirModal('modalPiquete');

        // Carrega os pastos disponíveis para o campo de seleção.
        carregarPastosParaSelect();
    };


    /* =====================================
       CARREGAR PASTOS NO SELECT
    ===================================== */

    // Função responsável por carregar os pastos
    // dentro do campo de seleção do formulário de piquetes.
    async function carregarPastosParaSelect() {

        try {

            // Faz uma requisição à API para obter os pastos.
            const data = await getAllPasto();

            // Extrai a lista de pastos da resposta.
            const pastos = lista(data, 'pastos');

            // Cria uma opção para cada pasto no campo de seleção.
            document.getElementById('pastofk').innerHTML =
                pastos.map(p => `
                    <option value="${escapar(p.pastoid)}">
                        ${escapar(p.descricao)}
                    </option>
                `).join('');

        } catch (e) {

            // Exibe o erro caso não seja possível carregar os pastos.
            alert(e.message);
        }
    }


    /* =====================================
       EDITAR PIQUETE
    ===================================== */

    // Busca um piquete pelo ID e preenche o formulário para edição.
    window.editarPiquete = async function (id) {

        try {

            // Busca os dados do piquete específico na API.
            const data = await getPiqueteByID(id);

            // Extrai o objeto piquete da resposta.
            // Os formatos alternativos permitem tratar diferentes estruturas.
            const p = primeiroRegistro(data);


            // Preenche o campo oculto com o ID do piquete.
            document.getElementById('piqueteid').value = p.piqueteid;

            // Preenche o campo de descrição.
            document.getElementById('descricaoPiquete').value =
                p.descricao;

            // Preenche a latitude.
            // Se o valor não existir, deixa o campo vazio.
            document.getElementById('latitude').value =
                p.latitude ?? '';

            // Preenche a longitude.
            // Se o valor não existir, deixa o campo vazio.
            document.getElementById('longitude').value =
                p.longitude ?? '';


            // Carrega as opções de pastos antes de selecionar o pasto atual.
            await carregarPastosParaSelect();

            // Seleciona o pasto ao qual o piquete está associado.
            document.getElementById('pastofk').value = p.pastoidfk;


            // Altera o título do modal para indicar edição.
            document.getElementById('tituloPiquete').textContent =
                'Editar piquete';

            // Abre o modal de edição.
            abrirModal('modalPiquete');

        } catch (e) {

            // Exibe uma mensagem se não for possível carregar o piquete.
            alert(e.message);
        }
    };


    /* =====================================
       EXCLUIR PIQUETE
    ===================================== */

    // Função responsável por excluir um piquete.
    window.excluirPiquete = async function (id) {

        // Solicita confirmação antes de excluir o registro.
        // Se o usuário cancelar, a função termina imediatamente.
        if (!confirmarExclusao()) return;

        try {

            // Envia uma requisição DELETE para a API.
            await deletePiquete(id);

            // Atualiza a tabela após a exclusão.
            carregarPiquetes();

        } catch (e) {

            // Exibe o erro caso a exclusão não seja realizada.
            alert(e.message);
        }
    };


    /* =====================================
       CADASTRAR E EDITAR PIQUETE
    ===================================== */

    // Registra o evento de envio do formulário de piquetes.
    formPiquete.addEventListener('submit', async function (e) {

        // Impede o recarregamento automático da página.
        e.preventDefault();


        // Obtém o ID do piquete.
        // Se estiver vazio, será um cadastro.
        // Se tiver valor, será uma edição.
        const id = document.getElementById('piqueteid').value;


        // Obtém os elementos HTML dos campos.
        // Guardar os elementos em variáveis facilita sua utilização.
        const campoDescricao =
            document.getElementById('descricaoPiquete');

        const campoLatitude =
            document.getElementById('latitude');

        const campoLongitude =
            document.getElementById('longitude');


        // Obtém os valores digitados pelo usuário.
        // trim() remove espaços desnecessários no início e no final.
        const descricao = campoDescricao.value.trim();

        const latitudeTexto = campoLatitude.value.trim();

        const longitudeTexto = campoLongitude.value.trim();


        // Converte as coordenadas para números.
        // Number() permite realizar comparações numéricas.
        const latitude = Number(latitudeTexto);

        const longitude = Number(longitudeTexto);


        /* =====================================
           VALIDAR DESCRIÇÃO
        ===================================== */

        // Verifica se a descrição foi preenchida.
        if (!descricao) {

            // Exibe a validação diretamente no campo de descrição.
            mostrarValidacao(
                campoDescricao,
                'Informe a descrição do piquete.'
            );

            // Interrompe o envio do formulário.
            return;
        }


        /* =====================================
           VALIDAR LATITUDE
        ===================================== */

        // Verifica se a latitude está vazia.
        if (latitudeTexto === '') {

            // Exibe a mensagem no campo de latitude.
            mostrarValidacao(
                campoLatitude,
                'Informe a latitude.'
            );

            // Interrompe o processamento.
            return;
        }


        // Verifica se a latitude é válida.
        // A latitude precisa ser um número entre -90 e 90.
        if (
            !Number.isFinite(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {

            // Mostra a mensagem de erro no próprio campo.
            mostrarValidacao(
                campoLatitude,
                'Latitude inválida. Informe um valor entre -90 e 90.'
            );

            // Impede que os dados inválidos sejam enviados.
            return;
        }


        /* =====================================
           VALIDAR LONGITUDE
        ===================================== */

        // Verifica se a longitude está vazia.
        if (longitudeTexto === '') {

            // Exibe a mensagem de validação no campo.
            mostrarValidacao(
                campoLongitude,
                'Informe a longitude.'
            );

            // Interrompe o processamento.
            return;
        }


        // Verifica se a longitude está dentro do intervalo permitido.
        // A longitude deve estar entre -180 e 180.
        if (
            !Number.isFinite(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {

            // Exibe a mensagem junto ao campo longitude.
            mostrarValidacao(
                campoLongitude,
                'Longitude inválida. Informe um valor entre -180 e 180.'
            );

            // Impede o envio dos dados inválidos.
            return;
        }


        /* =====================================
           MONTAR DADOS PARA A API
        ===================================== */

        // Cria o objeto com os dados do piquete.
        const dados = {

            // Descrição do piquete.
            descricao,

            // Latitude convertida para número.
            latitude,

            // Longitude convertida para número.
            longitude,

            // Obtém o ID do pasto selecionado
            // e converte o valor para número.
            pastoidfk: Number(
                document.getElementById('pastofk').value
            )
        };


        /* =====================================
           ENVIAR DADOS AO BACKEND
        ===================================== */

        try {

            // Decide qual endpoint será utilizado.
            // Se existir ID, será uma atualização.
            // Se não existir ID, será um novo cadastro.
            // Se existir ID, atualiza (UpdateX). Se não existir, cadastra (InsertX).
            if (id) {
                await updatePiquete(id, dados);
            } else {
                await insertPiquete(dados);
            }


            // Fecha o modal depois que a operação é concluída.
            fecharModal('modalPiquete');

            // Atualiza a tabela para mostrar os dados mais recentes.
            carregarPiquetes();

        } catch (e) {

            // Exibe o erro caso a operação falhe.
            alert(e.message);
        }
    });
    /* =====================================
       ANIMAIS
    ===================================== */

    // Obtém o elemento responsável por exibir os animais na tabela.
    const tabelaAnimais = document.getElementById('tabelaAnimais');

    // Obtém o formulário de cadastro e edição de animais.
    const formAnimal = document.getElementById('formAnimal');


    /* =====================================
       LISTAR ANIMAIS
    ===================================== */

    // Função global que carrega os animais cadastrados.
    window.carregarAnimais = async function () {

        try {

            // Solicita todos os animais cadastrados ao backend.
            const data = await getAllAnimal();

            // Extrai a lista de animais da resposta.
            const animais = lista(data, 'animais');


            // Percorre os animais e cria uma linha para cada registro.
            tabelaAnimais.innerHTML = animais.map(a => `
                <tr>

                    <!-- Exibe o ID do animal. -->
                    <td>${escapar(a.animalid)}</td>

                    <!-- Exibe o nome do animal. -->
                    <td>${escapar(a.nome)}</td>

                    <!-- Exibe a data de nascimento do animal. -->
                    <td>
                        ${escapar(
                            a.datanasc
                                ? String(a.datanasc).substring(0, 10)
                                : ''
                        )}
                    </td>

                    <td>

                        <!-- Botão para editar o animal.
                             Envia o ID para a função editarAnimal. -->
                        <button class="btn-action edit"
                            onclick="editarAnimal(${Number(a.animalid)})">
                            Editar
                        </button>

                        <!-- Botão para excluir o animal.
                             Envia o ID para a função excluirAnimal. -->
                        <button class="btn-action delete"
                            onclick="excluirAnimal(${Number(a.animalid)})">
                            Excluir
                        </button>

                    </td>
                </tr>
            `).join('');


            // Verifica se a lista de animais está vazia.
            // Caso esteja, exibe uma mensagem na tabela.
            if (!animais.length) {
                mensagemTabela(
                    tabelaAnimais,
                    'Nenhum animal cadastrado.'
                );
            }


            // Atualiza o contador de animais no dashboard.
            document.getElementById('totalAnimais').textContent =
                animais.length;

        } catch (e) {

            // Exibe o erro dentro da tabela caso a requisição falhe.
            mensagemTabela(tabelaAnimais, e.message);
        }
    };


    /* =====================================
       NOVO ANIMAL
    ===================================== */

    // Prepara o formulário para cadastrar um novo animal.
    window.novoAnimal = function () {

        // Limpa todos os campos do formulário.
        formAnimal.reset();

        // Limpa o ID do animal.
        // ID vazio indica que será criado um novo registro.
        document.getElementById('animalid').value = '';

        // Define o título do modal.
        document.getElementById('tituloAnimal').textContent =
            'Novo animal';

        // Abre o modal de cadastro.
        abrirModal('modalAnimal');
    };


    /* =====================================
       EDITAR ANIMAL
    ===================================== */

    // Busca os dados de um animal para preencher o formulário de edição.
    window.editarAnimal = async function (id) {

        try {

            // Solicita ao backend os dados do animal pelo ID.
            const data = await getAnimalByID(id);

            // Obtém o objeto animal da resposta.
            const a = primeiroRegistro(data);


            // Preenche o ID do animal no campo oculto.
            document.getElementById('animalid').value =
                a.animalid;

            // Preenche o nome do animal.
            document.getElementById('nomeAnimal').value =
                a.nome;

            // Preenche a data de nascimento.
            // Se não houver data, mantém o campo vazio.
            document.getElementById('dataNascAnimal').value =
                a.datanasc
                    ? String(a.datanasc).substring(0, 10)
                    : '';


            // Atualiza o título do modal.
            document.getElementById('tituloAnimal').textContent =
                'Editar animal';

            // Abre o modal de edição.
            abrirModal('modalAnimal');

        } catch (e) {

            // Exibe uma mensagem caso os dados não sejam carregados.
            alert(e.message);
        }
    };


    /* =====================================
       EXCLUIR ANIMAL
    ===================================== */

    // Função que exclui um animal pelo ID.
    window.excluirAnimal = async function (id) {

        // Solicita confirmação ao usuário.
        // Se ele cancelar, a exclusão não será realizada.
        if (!confirmarExclusao()) return;

        try {

            // Envia uma requisição DELETE para o backend.
            await deleteAnimal(id);

            // Atualiza a tabela após a exclusão.
            carregarAnimais();

        } catch (e) {

            // Exibe a mensagem de erro caso a exclusão falhe.
            alert(e.message);
        }
    };


    /* =====================================
       CADASTRAR E EDITAR ANIMAL
    ===================================== */

    // Registra o evento de envio do formulário de animais.
    formAnimal.addEventListener('submit', async function (e) {

        // Impede o recarregamento automático da página.
        e.preventDefault();


        // Obtém o ID do animal.
        // ID vazio significa cadastro.
        // ID preenchido significa edição.
        const id = document.getElementById('animalid').value;


        // Obtém o elemento HTML do campo nome.
        const campoNome =
            document.getElementById('nomeAnimal');

        // Obtém o elemento HTML do campo data de nascimento.
        const campoDataNasc =
            document.getElementById('dataNascAnimal');


        // Obtém o nome digitado e remove espaços extras.
        const nome = campoNome.value.trim();

        // Obtém a data de nascimento informada.
        const dataNasc = campoDataNasc.value;


        /* =====================================
           VALIDAR NOME
        ===================================== */

        // Verifica se o nome está vazio.
        if (!nome) {

            // Exibe uma mensagem diretamente no campo nome.
            mostrarValidacao(
                campoNome,
                'Informe o nome do animal.'
            );

            // Interrompe o envio do formulário.
            return;
        }


        /* =====================================
           VALIDAR DATA DE NASCIMENTO
        ===================================== */

        // Só realiza a validação se uma data foi informada.
        if (dataNasc) {

            // Obtém a data atual.
            const hoje = new Date();

            // Zera as horas, minutos, segundos e milissegundos.
            // Assim, a comparação considera somente o dia.
            hoje.setHours(0, 0, 0, 0);


            // Converte a data de nascimento para um objeto Date.
            // O horário fixo evita diferenças causadas pelo fuso horário.
            const nascimento = new Date(dataNasc + 'T00:00:00');


            // Verifica se a data foi convertida corretamente.
            if (Number.isNaN(nascimento.getTime())) {

                // Exibe a mensagem junto ao campo de data.
                mostrarValidacao(
                    campoDataNasc,
                    'Informe uma data de nascimento válida.'
                );

                // Interrompe o processamento.
                return;
            }


            // Verifica se a data de nascimento é posterior à data atual.
            if (nascimento > hoje) {

                // Exibe a mensagem de validação no próprio campo.
                mostrarValidacao(
                    campoDataNasc,
                    'A data de nascimento não pode ser futura.'
            );

                // Impede o envio de uma data inválida.
                return;
            }
        }


        /* =====================================
           MONTAR DADOS DO ANIMAL
        ===================================== */

        // Cria o objeto com os dados que serão enviados ao backend.
        const dados = {

            // Nome informado no formulário.
            nome,

            // Data de nascimento.
            // Se estiver vazia, envia null.
            datanasc: dataNasc || null
        };


        /* =====================================
           ENVIAR DADOS AO BACKEND
        ===================================== */

        try {

            // Escolhe o endpoint de acordo com a operação.
            // Se existir ID, atualiza (UpdateX). Se não existir, cadastra (InsertX).
            if (id) {
                await updateAnimal(id, dados);
            } else {
                await insertAnimal(dados);
            }


            // Fecha o modal após salvar com sucesso.
            fecharModal('modalAnimal');

            // Atualiza a tabela de animais.
            carregarAnimais();

        } catch (e) {

            // Exibe o erro caso o backend não aceite a operação.
            alert(e.message);
        }
    });
       /* =====================================
       ALOCAÇÕES
    ===================================== */

    // Obtém o corpo da tabela onde as alocações serão exibidas.
    const tabelaAlocados = document.getElementById('tabelaAlocados');

    // Obtém o formulário de cadastro e edição de alocações.
    const formAlocado = document.getElementById('formAlocado');


    /* =====================================
       LISTAR ALOCAÇÕES
    ===================================== */

    // Função responsável por carregar as alocações cadastradas.
    window.carregarAlocados = async function () {

        try {

            // Busca simultaneamente:
            // - Alocações;
            // - Animais;
            // - Piquetes.
            const [data, animaisData, piquetesData] = await Promise.all([
                getAllAlocado(),
                getAllAnimal(),
                getAllPiquete()
            ]);

            // Extrai a lista de alocações.
            const alocados = lista(data, 'alocados');

            // Extrai a lista de animais.
            const animais = lista(animaisData, 'animais');

            // Extrai a lista de piquetes.
            const piquetes = lista(piquetesData, 'piquetes');


            // Cria as linhas da tabela com os dados das alocações.
            tabelaAlocados.innerHTML = alocados.map(a => `
                <tr>
                    <td>${escapar(a.alocadoid)}</td>
                    <td>${escapar(a.animalnome)}</td>
                    <td>${escapar(a.piquetedescricao)}</td>

                    <td>
                        ${escapar(
                            a.datainicio
                                ? String(a.datainicio).substring(0, 10)
                                : ''
                        )}
                    </td>

                    <td>
                        ${escapar(
                            a.datafinal
                                ? String(a.datafinal).substring(0, 10)
                                : ''
                        )}
                    </td>

                    <td>
                        <button class="btn-action edit"
                            onclick="editarAlocado(${Number(a.alocadoid)})">
                            Editar
                        </button>

                        <button class="btn-action delete"
                            onclick="excluirAlocado(${Number(a.alocadoid)})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `).join('');


            // Exibe uma mensagem caso não existam alocações.
            if (!alocados.length) {
                mensagemTabela(
                    tabelaAlocados,
                    'Nenhuma alocação cadastrada.',
                    6
                );
            }


            // Atualiza o total de alocações no dashboard.
            document.getElementById('totalAlocados').textContent =
                alocados.length;


            // Atualiza os campos de seleção de animais e piquetes.
            preencherSelectsAlocado(animais, piquetes);

        } catch (e) {

            // Exibe o erro caso não seja possível carregar os dados.
            mensagemTabela(tabelaAlocados, e.message, 6);
        }
    };


    /* =====================================
       PREENCHER SELECTS
    ===================================== */

    // Preenche os campos de seleção com animais e piquetes.
    function preencherSelectsAlocado(animais, piquetes) {

        // Cria as opções de animais no campo de seleção.
        document.getElementById('animalfk').innerHTML =
            animais.map(a => `
                <option value="${escapar(a.animalid)}">
                    ${escapar(a.nome)}
                </option>
            `).join('');


        // Cria as opções de piquetes no campo de seleção.
        document.getElementById('piquetefk').innerHTML =
            piquetes.map(p => `
                <option value="${escapar(p.piqueteid)}">
                    ${escapar(p.descricao)}
                </option>
            `).join('');
    }


    /* =====================================
       NOVA ALOCAÇÃO
    ===================================== */

    // Prepara o formulário para cadastrar uma nova alocação.
    window.novoAlocado = function () {

        // Limpa os campos do formulário.
        formAlocado.reset();

        // Limpa o ID da alocação.
        // ID vazio indica um novo cadastro.
        document.getElementById('alocadoid').value = '';

        // Atualiza o título do modal.
        document.getElementById('tituloAlocado').textContent =
            'Nova alocação';


        // Carrega os animais e piquetes disponíveis.
        carregarDadosAlocado();

        // Abre o modal de cadastro.
        abrirModal('modalAlocado');
    };


    /* =====================================
       CARREGAR ANIMAIS E PIQUETES
    ===================================== */

    // Busca os dados necessários para os campos de seleção.
    async function carregarDadosAlocado() {

        try {

            // Busca animais e piquetes simultaneamente.
            const [animaisData, piquetesData] = await Promise.all([
                getAllAnimal(),
                getAllPiquete()
            ]);

            // Extrai as listas e preenche os campos select.
            preencherSelectsAlocado(
                lista(animaisData, 'animais'),
                lista(piquetesData, 'piquetes')
            );

        } catch (e) {

            // Exibe o erro se os dados não forem carregados.
            alert(e.message);
        }
    }


    /* =====================================
       EDITAR ALOCAÇÃO
    ===================================== */

    // Busca uma alocação específica e preenche o formulário.
    window.editarAlocado = async function (id) {

        try {

            // Busca a alocação pelo ID.
            const data = await getAlocadoByID(id);

            // Obtém os dados da alocação.
            const a = primeiroRegistro(data);


            // Carrega os animais e piquetes disponíveis.
            await carregarDadosAlocado();


            // Preenche o ID da alocação.
            document.getElementById('alocadoid').value =
                a.alocadoid;

            // Seleciona o animal relacionado à alocação.
            document.getElementById('animalfk').value =
                a.animalidfk;

            // Seleciona o piquete relacionado à alocação.
            document.getElementById('piquetefk').value =
                a.piqueteidfk;


            // Preenche a data inicial.
            document.getElementById('dataInicio').value =
                a.datainicio
                    ? String(a.datainicio).substring(0, 10)
                    : '';

            // Preenche a data final.
            // Se não houver data final, o campo fica vazio.
            document.getElementById('dataFinal').value =
                a.datafinal
                    ? String(a.datafinal).substring(0, 10)
                    : '';


            // Altera o título do modal para edição.
            document.getElementById('tituloAlocado').textContent =
                'Editar alocação';

            // Abre o modal de edição.
            abrirModal('modalAlocado');

        } catch (e) {

            // Exibe o erro caso a consulta falhe.
            alert(e.message);
        }
    };


    /* =====================================
       EXCLUIR ALOCAÇÃO
    ===================================== */

    // Exclui uma alocação pelo ID.
    window.excluirAlocado = async function (id) {

        // Solicita confirmação antes de excluir.
        if (!confirmarExclusao()) return;

        try {

            // Envia a requisição DELETE ao backend.
            await deleteAlocado(id);

            // Atualiza a tabela após a exclusão.
            carregarAlocados();

        } catch (e) {

            // Exibe o erro caso a exclusão falhe.
            alert(e.message);
        }
    };


    /* =====================================
       CADASTRAR E EDITAR ALOCAÇÃO
    ===================================== */

    // Registra o evento de envio do formulário.
    formAlocado.addEventListener('submit', async function (e) {

        // Impede o recarregamento da página.
        e.preventDefault();


        // Obtém o ID da alocação.
        // Se estiver vazio, será um cadastro.
        // Se estiver preenchido, será uma edição.
        const id = document.getElementById('alocadoid').value;


        // Obtém a data inicial informada.
        const dataInicio =
            document.getElementById('dataInicio').value;

        // Obtém a data final informada.
        const dataFinal =
            document.getElementById('dataFinal').value;


        /* =====================================
           VALIDAR DATA INICIAL
        ===================================== */

        // A data inicial é obrigatória.
        if (!dataInicio) {

            // Exibe a mensagem caso a data inicial esteja vazia.
            alert('Informe a data inicial da alocação.');

            // Interrompe o processamento.
            return;
        }


        /* =====================================
           VALIDAR DATA FINAL
        ===================================== */

        // A data final é opcional.
        // A comparação só acontece se ela tiver sido preenchida.
        if (dataFinal && dataFinal < dataInicio) {

            // Impede que a data final seja anterior à inicial.
            alert('A data final não pode ser anterior à data inicial.');

            // Interrompe o processamento.
            return;
        }


        /* =====================================
           MONTAR DADOS
        ===================================== */

        // Cria o objeto que será enviado ao backend.
        const dados = {

            // Obtém o ID do animal e converte para número.
            animalidfk: Number(
                document.getElementById('animalfk').value
            ),

            // Obtém o ID do piquete e converte para número.
            piqueteidfk: Number(
                document.getElementById('piquetefk').value
            ),

            // Envia a data inicial.
            datainicio: dataInicio,

            // Se a data final estiver vazia, envia null.
            datafinal: dataFinal || null
        };


        /* =====================================
           ENVIAR AO BACKEND
        ===================================== */

        try {

            // Define o endpoint de acordo com a operação.
            // Se existir ID, atualiza (UpdateX). Se não existir, cadastra (InsertX).
            if (id) {
                await updateAlocado(id, dados);
            } else {
                await insertAlocado(dados);
            }


            // Fecha o modal após salvar.
            fecharModal('modalAlocado');

            // Atualiza a tabela de alocações.
            carregarAlocados();

        } catch (e) {

            // Exibe o erro caso a operação falhe.
            alert(e.message);
        }
    });    
    /* =====================================
       ENCERRAMENTO DO SCRIPT
    ===================================== */

    // Fecha o evento DOMContentLoaded iniciado na Parte 1.
    // Todas as funções anteriores estão dentro deste evento.
});