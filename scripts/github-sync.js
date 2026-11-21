/**
 * OBSERVATÓRIO CIDADÃO DE SÃO PAULO
 * Script de Sincronização, Versionamento e Releases no GitHub
 *
 * Funcionalidades:
 * 1. Conecta à API do GitHub com o Personal Access Token (PAT).
 * 2. Inicia o repositório se vazio e obtém o branch principal (main).
 * 3. Envia arquivos com retry automático e monta a árvore Git.
 * 4. Cria commits e publica Releases oficiais (v1.0.0, v1.1.0) preservando
 *    todas as versões anteriores na aba Releases do GitHub com o CHANGELOG.md.
 */

const fs = require("fs");
const path = require("path");

const GITHUB_API = "https://api.github.com";

function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      if (line.startsWith("GITHUB_TOKEN=")) {
        return line.replace("GITHUB_TOKEN=", "").trim();
      }
    }
  }
  return null;
}

const IGNORED_PATHS = [
  "node_modules",
  ".next",
  ".git",
  ".env",
  ".env.local",
  ".system_generated",
  "data/citizen-votes.json",
];

function shouldIgnore(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  return IGNORED_PATHS.some(
    (ignored) => normalized === ignored || normalized.startsWith(ignored + "/")
  );
}

function getAllFiles(dir, base = "") {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(base, file).replace(/\\/g, "/");
    if (shouldIgnore(relPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

async function githubFetch(url, options = {}, retries = 3) {
  const token = getGitHubToken();
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN não configurado. Por favor, forneça o seu Personal Access Token do GitHub."
    );
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${GITHUB_API}${url}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Observatorio-Cidadao-SP-Agent",
          ...(options.headers || {}),
        },
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("json") ? await res.json() : await res.text();

      if (!res.ok) {
        throw new Error(
          `GitHub API Erro [${res.status}]: ${
            typeof data === "object" ? data.message || JSON.stringify(data) : data
          }`
        );
      }
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`  ! Tentativa ${attempt} falhou (${err.message}). Aguardando 2s para tentar novamente...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function verifyAuth() {
  const user = await githubFetch("/user");
  console.log(`✓ Conectado ao GitHub com sucesso: @${user.login} (${user.name || "Cidadão"})`);
  return user;
}

async function getOrCreateRepo(repoName = "observatorio-cidadao-sp", isPrivate = false) {
  const user = await verifyAuth();
  try {
    const existing = await githubFetch(`/repos/${user.login}/${repoName}`);
    console.log(`✓ Repositório existente localizado: ${existing.html_url}`);
    return existing;
  } catch (err) {
    if (err.message.includes("404") || err.message.includes("Not Found")) {
      console.log(`→ Criando novo repositório @${user.login}/${repoName}...`);
      const created = await githubFetch("/user/repos", {
        method: "POST",
        body: JSON.stringify({
          name: repoName,
          description:
            "Plataforma independente de transparência pública, participação popular e fiscalização cidadã de São Paulo.",
          private: isPrivate,
          has_issues: true,
          has_projects: true,
          has_wiki: true,
        }),
      });
      console.log(`✓ Repositório criado com sucesso: ${created.html_url}`);
      return created;
    }
    throw err;
  }
}

async function createBlob(owner, repo, content, encoding = "utf-8") {
  const res = await githubFetch(`/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({
      content,
      encoding,
    }),
  });
  return res.sha;
}

async function syncCodebaseToGitHub(repoName = "observatorio-cidadao-sp", version = "1.0.0") {
  const user = await verifyAuth();
  const repo = await getOrCreateRepo(repoName);
  const owner = user.login;

  // 1. Obter ou inicializar o commit pai
  let parentCommitSha = null;
  let baseTreeSha = null;
  try {
    const ref = await githubFetch(`/repos/${owner}/${repoName}/git/ref/heads/main`);
    parentCommitSha = ref.object.sha;
    const parentCommit = await githubFetch(`/repos/${owner}/${repoName}/git/commits/${parentCommitSha}`);
    baseTreeSha = parentCommit.tree.sha;
    console.log(`✓ Branch 'main' ativa identificada (${parentCommitSha.slice(0, 7)})`);
  } catch {
    console.log(`→ Inicializando repositório com README.md inicial...`);
    const readmeContent = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf-8");
    const initRes = await githubFetch(`/repos/${owner}/${repoName}/contents/README.md`, {
      method: "PUT",
      body: JSON.stringify({
        message: "feat: inicialização do repositório",
        content: Buffer.from(readmeContent).toString("base64"),
      }),
    });
    parentCommitSha = initRes.commit.sha;
    console.log(`✓ Repositório inicializado com sucesso (${parentCommitSha.slice(0, 7)})`);
  }

  // 2. Escanear arquivos
  console.log(`→ Escaneando arquivos do projeto para upload...`);
  const files = getAllFiles(process.cwd());
  console.log(`→ ${files.length} arquivos selecionados para versionamento.`);

  // 3. Montar itens da árvore Git
  console.log(`→ Preparando árvore Git de arquivos...`);
  const treeItems = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const isBinary = /\.(png|jpg|jpeg|gif|ico|pdf|xlsx|zip)$/i.test(f.relPath);

    if (isBinary) {
      const buffer = fs.readFileSync(f.fullPath);
      const blobSha = await createBlob(owner, repoName, buffer.toString("base64"), "base64");
      treeItems.push({
        path: f.relPath,
        mode: "100644",
        type: "blob",
        sha: blobSha,
      });
    } else {
      const text = fs.readFileSync(f.fullPath, "utf-8");
      // Se arquivo for menor que 80KB, envia direto inline na árvore (rápido e atômico)
      if (Buffer.byteLength(text, "utf-8") < 80000) {
        treeItems.push({
          path: f.relPath,
          mode: "100644",
          type: "blob",
          content: text,
        });
      } else {
        const blobSha = await createBlob(owner, repoName, text, "utf-8");
        treeItems.push({
          path: f.relPath,
          mode: "100644",
          type: "blob",
          sha: blobSha,
        });
      }
    }

    if ((i + 1) % 15 === 0 || i === files.length - 1) {
      console.log(`  Arquivos processados: ${i + 1}/${files.length}...`);
    }
  }

  // 4. Criar a árvore Git no GitHub
  console.log(`→ Enviando Git Tree consolidada...`);
  const treeBody = { tree: treeItems };
  if (baseTreeSha) {
    treeBody.base_tree = baseTreeSha;
  }

  const tree = await githubFetch(`/repos/${owner}/${repoName}/git/trees`, {
    method: "POST",
    body: JSON.stringify(treeBody),
  });
  console.log(`✓ Git Tree criada com sucesso (${tree.sha.slice(0, 7)})`);

  // 5. Criar o commit
  const commitMessage = `release: versão ${version} - Observatório Cidadão de SP\n\n- Entregas completas das Fases 1 a 5\n- Dados reais PNCP e SIURB\n- Resumo IA e visualizações gráficas\n- Participação popular auditável com token HMAC e LGPD`;
  console.log(`→ Criando commit no GitHub: "${commitMessage.split("\n")[0]}"`);

  const commit = await githubFetch(`/repos/${owner}/${repoName}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: commitMessage,
      tree: tree.sha,
      parents: parentCommitSha ? [parentCommitSha] : [],
    }),
  });
  console.log(`✓ Commit criado: ${commit.sha.slice(0, 7)}`);

  // 6. Atualizar a branch main
  await githubFetch(`/repos/${owner}/${repoName}/git/refs/heads/main`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: true }),
  });
  console.log(`✓ Branch 'main' atualizada com o commit ${commit.sha.slice(0, 7)}`);

  // 7. Criar a Tag e a Release oficial
  const tag = version.startsWith("v") ? version : `v${version}`;
  try {
    const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
    const changelog = fs.existsSync(changelogPath)
      ? fs.readFileSync(changelogPath, "utf-8")
      : "Release oficial documentada.";

    console.log(`→ Criando Release oficial ${tag}...`);
    const release = await githubFetch(`/repos/${owner}/${repoName}/releases`, {
      method: "POST",
      body: JSON.stringify({
        tag_name: tag,
        target_commitish: commit.sha,
        name: `Observatório Cidadão de SP - ${tag}`,
        body: changelog,
        draft: false,
        prerelease: false,
      }),
    });
    console.log(`✓ Release ${tag} publicada com sucesso: ${release.html_url}`);
  } catch (err) {
    console.warn(`! Aviso ao criar Release (a tag já pode existir):`, err.message);
  }

  console.log(`\n🎉 PROJETO PUBLICADO COM SUCESSO NO GITHUB!`);
  console.log(`Repositório: ${repo.html_url}`);
  console.log(`Releases: ${repo.html_url}/releases\n`);

  return {
    repoUrl: repo.html_url,
    releasesUrl: `${repo.html_url}/releases`,
    version: tag,
    commitSha: commit.sha,
  };
}

module.exports = {
  getGitHubToken,
  verifyAuth,
  getOrCreateRepo,
  syncCodebaseToGitHub,
  getAllFiles,
  githubFetch,
};

if (require.main === module) {
  (async () => {
    try {
      const version = process.argv[2] || "1.0.0";
      await syncCodebaseToGitHub("observatorio-cidadao-sp", version);
    } catch (e) {
      console.error("\n❌ Falha na sincronização com o GitHub:", e.message);
      process.exit(1);
    }
  })();
}
