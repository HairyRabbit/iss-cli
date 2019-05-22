export = GitHub;
declare class GitHub {
  constructor(auth: any, ...args: any[]);
  getGist(id: any): any;
  getIssues(user: any, repo: any): any;
  getMarkdown(): any;
  getOrganization(organization: any): any;
  getProject(id: any): any;
  getRateLimit(): any;
  getRepo(user: any, repo: any): any;
  getTeam(teamId: any): any;
  getUser(user: any): any;
  search(query: any): any;
}
