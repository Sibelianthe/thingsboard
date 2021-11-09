///
/// Copyright © 2016-2021 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from '../core.state';
import { selectAuth, selectIsAuthenticated } from '../auth/auth.selectors';
import { take } from 'rxjs/operators';
import { HomeSection, MenuSection } from '@core/services/menu.models';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Authority } from '@shared/models/authority.enum';
import { guid } from '@core/utils';
import { AuthState } from '@core/auth/auth.models';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  menuSections$: Subject<Array<MenuSection>> = new BehaviorSubject<Array<MenuSection>>([]);
  homeSections$: Subject<Array<HomeSection>> = new BehaviorSubject<Array<HomeSection>>([]);
  showText$: Subject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private store: Store<AppState>) {
    this.store.pipe(select(selectIsAuthenticated)).subscribe(
      (authenticated: boolean) => {
        if (authenticated) {
          this.buildMenu();
        }
      }
      );
    this.showText$.subscribe(showText => {
      let menuSections: Array<MenuSection>;
      this.menuSections$.subscribe(sections => menuSections = sections).unsubscribe();
      menuSections.forEach(section => {
        section.showText = showText;
        section.id = guid()
        if (section.type === 'toggle') {
          section.pages.forEach(subsection => {
            subsection.showText = showText;
          })
        }
      })
      this.menuSections$.next(menuSections);
    });
  }
  
  private buildMenu() {
    this.store.pipe(select(selectAuth), take(1)).subscribe(
      (authState: AuthState) => {
        if (authState.authUser) {
          let menuSections: Array<MenuSection>;
          let homeSections: Array<HomeSection>;
          switch (authState.authUser.authority) {
            case Authority.SYS_ADMIN:
              menuSections = this.buildSysAdminMenu();
              homeSections = this.buildSysAdminHome();
              break;
            case Authority.TENANT_ADMIN:
              menuSections = this.buildTenantAdminMenu(authState);
              homeSections = this.buildTenantAdminHome(authState);
              break;
            case Authority.CUSTOMER_USER:
              menuSections = this.buildCustomerUserMenu(authState);
              homeSections = this.buildCustomerUserHome(authState);
              break;
          }
          this.menuSections$.next(menuSections);
          this.homeSections$.next(homeSections);
        }
      }
    );
  }

  private buildSysAdminMenu(): Array<MenuSection> {
    const sections: Array<MenuSection> = [];
    sections.push(
      {
        id: guid(),
        name: 'home.home',
        type: 'link',
        path: '/home',
        icon: 'home',
        showText: true,
      },
      {
        id: guid(),
        name: 'tenant.tenants',
        type: 'link',
        path: '/tenants',
        icon: 'supervisor_account',
        showText: true,
      },
      {
        id: guid(),
        name: 'tenant-profile.tenant-profiles',
        type: 'link',
        path: '/tenantProfiles',
        icon: 'mdi:alpha-t-box',
        isMdiIcon: true,
        showText: true,
      },
      {
        id: guid(),
        name: 'widget.widget-library',
        type: 'link',
        path: '/widgets-bundles',
        icon: 'now_widgets',
        showText: true,
      },
      {
        id: guid(),
        name: 'admin.system-settings',
        type: 'toggle',
        path: '/settings',
        height: '240px',
        icon: 'settings',
        showText: true,
        pages: [
          {
            id: guid(),
            name: 'admin.general',
            type: 'link',
            path: '/settings/general',
            icon: 'settings_applications',
            showText: true,
          },
          {
            id: guid(),
            name: 'admin.outgoing-mail',
            type: 'link',
            path: '/settings/outgoing-mail',
            icon: 'mail',
            showText: true,
          },
          {
            id: guid(),
            name: 'admin.sms-provider',
            type: 'link',
            path: '/settings/sms-provider',
            icon: 'sms',
            showText: true,
          },
          {
            id: guid(),
            name: 'admin.security-settings',
            type: 'link',
            path: '/settings/security-settings',
            icon: 'security',
            showText: true,
          },
          {
            id: guid(),
            name: 'admin.oauth2.oauth2',
            type: 'link',
            path: '/settings/oauth2',
            icon: 'security',
            showText: true,
          },
          {
            id: guid(),
            name: 'resource.resources-library',
            type: 'link',
            path: '/settings/resources-library',
            icon: 'folder',
            showText: true,
          }
        ]
      }
    );
    return sections;
  }

  private buildSysAdminHome(): Array<HomeSection> {
    const homeSections: Array<HomeSection> = [];
    homeSections.push(
      {
        name: 'tenant.management',
        places: [
          {
            name: 'tenant.tenants',
            icon: 'supervisor_account',
            path: '/tenants'
          },
          {
            name: 'tenant-profile.tenant-profiles',
            icon: 'mdi:alpha-t-box',
            isMdiIcon: true,
            path: '/tenantProfiles'
          },
        ],
      },
      {
        name: 'widget.management',
        places: [
          {
            name: 'widget.widget-library',
            icon: 'now_widgets',
            path: '/widgets-bundles'
          }
        ],
      },
      {
        name: 'admin.system-settings',
        places: [
          {
            name: 'admin.general',
            icon: 'settings_applications',
            path: '/settings/general',
          },
          {
            name: 'admin.outgoing-mail',
            icon: 'mail',
            path: '/settings/outgoing-mail',
          },
          {
            name: 'admin.sms-provider',
            icon: 'sms',
            path: '/settings/sms-provider',
          },
          {
            name: 'admin.security-settings',
            icon: 'security',
            path: '/settings/security-settings',
          },
          {
            name: 'admin.oauth2.oauth2',
            icon: 'security',
            path: '/settings/oauth2',
          },
          {
            name: 'resource.resources-library',
            icon: 'folder',
            path: '/settings/resources-library',
          }
        ]
      }
    );
    return homeSections;
  }

  private buildTenantAdminMenu(authState: AuthState, getAll: boolean = false): Array<MenuSection> {
    const sections: Array<MenuSection> = [];
    let showText: boolean;
    this.showText$.subscribe(show => showText = show);
    sections.push(
      {
        id: guid(),
        name: 'home.home',
        type: 'link',
        path: '/home',
        notExact: true,
        icon: 'home',
        showText,
      },
      {
        id: guid(),
        name: 'rulechain.rulechains',
        type: 'link',
        path: '/ruleChains',
        icon: 'settings_ethernet',
        showText,
      },
      {
        id: guid(),
        name: 'customer.customers',
        type: 'link',
        path: '/customers',
        icon: 'supervisor_account',
        showText,
      },
      {
        id: guid(),
        name: 'asset.assets',
        type: 'link',
        path: '/assets',
        icon: 'domain',
        showText,
      },
      {
        id: guid(),
        name: 'device.devices',
        type: 'link',
        path: '/devices',
        icon: 'devices_other',
        showText,
      },
      {
        id: guid(),
        name: 'device-profile.device-profiles',
        type: 'link',
        path: '/deviceProfiles',
        icon: 'mdi:alpha-d-box',
        isMdiIcon: true,
        showText,
      },
      {
        id: guid(),
        name: 'ota-update.ota-updates',
        type: 'link',
        path: '/otaUpdates',
        icon: 'memory',
        showText,
      },
      {
        id: guid(),
        name: 'entity-view.entity-views',
        type: 'link',
        path: '/entityViews',
        icon: 'view_quilt',
        showText,
      }
    );
    if (getAll || authState.edgesSupportEnabled) {
      sections.push(
        {
          id: guid(),
          name: 'edge.edge-instances',
          type: 'link',
          path: '/edgeInstances',
          icon: 'router',
          showText,
        },
        {
          id: guid(),
          name: 'edge.management',
          type: 'toggle',
          path: '/edgeManagement',
          height: '40px',
          icon: 'settings_input_antenna',
          showText,
          pages: [
            {
              id: guid(),
              name: 'edge.rulechain-templates',
              type: 'link',
              path: '/edgeManagement/ruleChains',
              icon: 'settings_ethernet',
              showText,
            }
          ]
        }
      );
    }
    sections.push(
      {
        id: guid(),
        name: 'widget.widget-library',
        type: 'link',
        path: '/widgets-bundles',
        icon: 'now_widgets',
        showText,
      },
      {
        id: guid(),
        name: 'dashboard.dashboards',
        type: 'link',
        path: '/dashboards',
        icon: 'dashboards',
        showText,
      },
      {
        id: guid(),
        name: 'audit-log.audit-logs',
        type: 'link',
        path: '/auditLogs',
        icon: 'track_changes',
        showText,
      },
      {
        id: guid(),
        name: 'api-usage.api-usage',
        type: 'link',
        path: '/usage',
        icon: 'insert_chart',
        notExact: true,
        showText,
      },
      {
        id: guid(),
        name: 'admin.system-settings',
        type: 'toggle',
        path: '/settings',
        height: '80px',
        icon: 'settings',
        showText,
        pages: [
          {
            id: guid(),
            name: 'admin.home-settings',
            type: 'link',
            path: '/settings/home',
            icon: 'settings_applications',
            showText,
          },
          {
            id: guid(),
            name: 'resource.resources-library',
            type: 'link',
            path: '/settings/resources-library',
            icon: 'folder',
            showText,
          }
        ]
      }
    );
    return sections;
  }

  private buildTenantAdminHome(authState: AuthState): Array<HomeSection> {
    const homeSections: Array<HomeSection> = [];
    homeSections.push(
      {
        name: 'rulechain.management',
        places: [
          {
            name: 'rulechain.rulechains',
            icon: 'settings_ethernet',
            path: '/ruleChains',
          }
        ]
      },
      {
        name: 'customer.management',
        places: [
          {
            name: 'customer.customers',
            icon: 'supervisor_account',
            path: '/customers',
          }
        ]
      },
      {
        name: 'asset.management',
        places: [
          {
            name: 'asset.assets',
            icon: 'domain',
            path: '/assets',
          }
        ]
      },
      {
        name: 'device.management',
        places: [
          {
            name: 'device.devices',
            icon: 'devices_other',
            path: '/devices',
          },
          {
            name: 'device-profile.device-profiles',
            icon: 'mdi:alpha-d-box',
            isMdiIcon: true,
            path: '/deviceProfiles',
          },
          {
            name: 'ota-update.ota-updates',
            icon: 'memory',
            path: '/otaUpdates',
          }
        ]
      },
      {
        name: 'entity-view.management',
        places: [
          {
            name: 'entity-view.entity-views',
            icon: 'view_quilt',
            path: '/entityViews',
          }
        ]
      }
    );
    if (authState.edgesSupportEnabled) {
      homeSections.push(
        {
          name: 'edge.management',
          places: [
            {
              name: 'edge.edge-instances',
              icon: 'router',
              path: '/edgeInstances'
            },
            {
              name: 'edge.rulechain-templates',
              icon: 'settings_ethernet',
              path: '/edgeManagement/ruleChains'
            }
          ]
        }
      );
    }
    homeSections.push(
      {
        name: 'dashboard.management',
        places: [
          {
            name: 'widget.widget-library',
            icon: 'now_widgets',
            path: '/widgets-bundles',
          },
          {
            name: 'dashboard.dashboards',
            icon: 'dashboard',
            path: '/dashboards',
          }
        ]
      },
      {
        name: 'audit-log.audit',
        places: [
          {
            name: 'audit-log.audit-logs',
            icon: 'track_changes',
            path: '/auditLogs',
          },
          {
            name: 'api-usage.api-usage',
            icon: 'insert_chart',
            path: '/usage',
          }
        ]
      },
      {
        name: 'admin.system-settings',
        places: [
          {
            name: 'admin.home-settings',
            icon: 'settings_applications',
            path: '/settings/home',
          },
          {
            name: 'resource.resources-library',
            icon: 'folder',
            path: '/settings/resources-library',
          }
        ]
      }
    );
    return homeSections;
  }

  private buildCustomerUserMenu(authState: AuthState, getAll: boolean = false): Array<MenuSection> {
    const sections: Array<MenuSection> = [];
    sections.push(
      {
        id: guid(),
        name: 'home.home',
        type: 'link',
        path: '/home',
        notExact: true,
        icon: 'home',
        showText: true,
      },
      {
        id: guid(),
        name: 'asset.assets',
        type: 'link',
        path: '/assets',
        icon: 'domain',
        showText: true,
      },
      {
        id: guid(),
        name: 'device.devices',
        type: 'link',
        path: '/devices',
        icon: 'devices_other',
        showText: true,
      },
      {
        id: guid(),
        name: 'entity-view.entity-views',
        type: 'link',
        path: '/entityViews',
        icon: 'view_quilt',
        showText: true,
      }
    );
    if (getAll || authState.edgesSupportEnabled) {
      sections.push(
        {
          id: guid(),
          name: 'edge.edge-instances',
          type: 'link',
          path: '/edgeInstances',
          icon: 'router',
          showText: true,
        }
      );
    }
    sections.push(
      {
        id: guid(),
        name: 'dashboard.dashboards',
        type: 'link',
        path: '/dashboards',
        icon: 'dashboard',
        showText: true,
      }
    );
    return sections;
  }

  private buildCustomerUserHome(authState: AuthState): Array<HomeSection> {
    const homeSections: Array<HomeSection> = [];
    homeSections.push(
      {
        name: 'asset.view-assets',
        places: [
          {
            name: 'asset.assets',
            icon: 'domain',
            path: '/assets',
          }
        ]
      },
      {
        name: 'device.view-devices',
        places: [
          {
            name: 'device.devices',
            icon: 'devices_other',
            path: '/devices',
          }
        ]
      },
      {
        name: 'entity-view.management',
        places: [
          {
            name: 'entity-view.entity-views',
            icon: 'view_quilt',
            path: '/entityViews',
          }
        ]
      }
    );
    if (authState.edgesSupportEnabled) {
      homeSections.push(
        {
          name: 'edge.management',
          places: [
            {
              name: 'edge.edge-instances',
              icon: 'settings_input_antenna',
              path: '/edgeInstances',
            }
          ]
        }
      );
    }
    homeSections.push(
      {
        name: 'dashboard.view-dashboards',
        places: [
          {
            name: 'dashboard.dashboards',
            icon: 'dashboard',
            path: '/dashboards',
          }
        ]
      }
    );
    return homeSections;
  }

  public menuSections(): Observable<Array<MenuSection>> {
    return this.menuSections$;
  }

  public homeSections(): Observable<Array<HomeSection>> {
    return this.homeSections$;
  }

  public updateMenuSection(menu) {
    let menuSections: Array<MenuSection>;
    this.menuSections$.subscribe(sections => menuSections = sections).unsubscribe();
    menu.forEach((menuEntry) => {
      const idx = menuSections.findIndex(e => e.path === menuEntry.path)
      if (idx >= 0) {
        menuSections[idx] = { ...menuSections[idx], id: guid(), ...menuEntry }
        if (menuEntry.showEntry === false) {
          menuSections.splice(idx, 1)
        }
      } else if (menuEntry.path.split('/').length > 2) {
        // FIXME: sections are built correctly, but menu doesn't get hidden .. why ?
        // Didn't find it in top level links, let's look for it in pages:
        // Down only one level (else we'd need to do this recursively)
        const parentPath = '/' + menuEntry.path.split('/')[1] // Get /settings for example
        const toggleSectionIndex = menuSections.findIndex(e => e.path === parentPath)
        if (toggleSectionIndex >= 0) {
          const pageIndex = menuSections[toggleSectionIndex].pages.findIndex(e => e.path === menuEntry.path)
          if (pageIndex >= 0) {
            menuSections[toggleSectionIndex].pages[pageIndex] = { ...menuSections[toggleSectionIndex].pages[pageIndex], id: guid(), ...menuEntry }
            if (menuEntry.showEntry === false) {
              menuSections[toggleSectionIndex].pages.splice(pageIndex, 1)
              if (menuSections[toggleSectionIndex].pages.length === 0) {
                menuSections.splice(toggleSectionIndex, 1)
              }
            }
          }
        }

      }
    })
    this.menuSections$.next(menuSections)
  }

  public updateHomeSection(menu) {
    let homeSections: Array<HomeSection>;
    this.homeSections$.subscribe(sections => homeSections = sections).unsubscribe();
    menu.forEach(newEntry => {
      homeSections.forEach((section, sectionIndex) => {
        const idx = section.places.findIndex(place => place.path === newEntry.path)
        if (idx >= 0) {
          section.places[idx] = { ...section.places[idx], ...newEntry }
          if (newEntry.showEntry === false) {
            section.places.splice(idx, 1)
            if (section.places.length === 0) {
              homeSections.splice(sectionIndex, 1)
            }
          }
        }
      })
    })
    this.homeSections$.next(homeSections)
  }

  public getMenus() {
    const sanitizeMenu = sections => {
      sections.forEach(section => {
        if (section.type === 'toggle') {
          sanitizeMenu(section.pages);
          section.pages.forEach(page => {
            sections.push(page);
          });
          delete section.pages;
        }
        delete section.id;
        delete section.showText;
        delete section.height;
        delete section.type;
        section.showEntry = true;
      })
    }
    const tenantAdmin = this.buildTenantAdminMenu(null, true);
    const customer = this.buildCustomerUserMenu(null, true);
    sanitizeMenu(tenantAdmin);
    sanitizeMenu(customer);
    return {tenantAdmin, customer}
  }
}

