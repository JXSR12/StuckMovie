import Router from "next/router";

export class SidebarNav{
    static currentPathname = "/home";

    static handleSidebarButton = (key: string) => {
        if(key === 'Employees'){
          if(Router.pathname !== '/next'){
            Router.push('/next');
            SidebarNav.currentPathname = '/next';
          }
        }else if(key === 'Approvals'){
          if(Router.pathname !== '/pendings'){
            Router.push('/pendings');
            SidebarNav.currentPathname = '/pendings';
          }
        }else if(key === 'ESS'){
          if(Router.pathname !== '/ess'){
            Router.push('/ess');
            SidebarNav.currentPathname = '/ess';
          }
        }else if(key === 'Movies'){
          if(Router.pathname !== '/movies'){
            Router.push('/movies');
            SidebarNav.currentPathname = '/movies';
          }
        }
      }
}