import { Octokit } from "octokit";


const PERSONAL_TOKEN = "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"

const octokit = new Octokit({auth: PERSONAL_TOKEN})


const {data: {login}} = await octokit.rest.users.getAuthenticated()




const getDataGithub = () => {

  try {
    const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: "CesarMartinez7", repo: "TESTING-ELISA", path: "colecciones", message: "last-changes-testing", committer : {
        name: "CESAR octokit",
        email: "cesarwamartinez@gmail.com"
      }, content: "bXkgdXBkYXRlZCBmaWxlIGNvbnRlbnRz",  sha: '95b966ae1c166bd92f8ae7d1c313e738c731dfc3',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  }catch (err) {
    console.log(`error ${err}`)
  }

}



getDataGithub()

console.log("Hello, %s", login)