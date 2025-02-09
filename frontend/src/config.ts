export const config = {
  github: {
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
    path: 'data/heartrate',
    token: process.env.GITHUB_TOKEN
  }
};