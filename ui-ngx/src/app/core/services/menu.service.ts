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
import { AuthService } from '../auth/auth.service';
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

  constructor(private store: Store<AppState>, private authService: AuthService) {
    this.store.pipe(select(selectIsAuthenticated)).subscribe(
      (authenticated: boolean) => {
        this.showText$.subscribe(showText => {
          if (authenticated) {
            this.buildMenu(showText);
          }
        });
      }
    );
  }
  
  private buildMenu(showText: boolean) {
    this.store.pipe(select(selectAuth), take(1)).subscribe(
      (authState: AuthState) => {
        if (authState.authUser) {
          let menuSections: Array<MenuSection>;
          let homeSections: Array<HomeSection>;
          switch (authState.authUser.authority) {
            case Authority.SYS_ADMIN:
              menuSections = this.buildSysAdminMenu(authState, showText);
              homeSections = this.buildSysAdminHome(authState, showText);
              break;
            case Authority.TENANT_ADMIN:
              menuSections = this.buildTenantAdminMenu(authState, showText);
              homeSections = this.buildTenantAdminHome(authState, showText);
              break;
            case Authority.CUSTOMER_USER:
              menuSections = this.buildCustomerUserMenu(authState, showText);
              homeSections = this.buildCustomerUserHome(authState, showText);
              break;
          }
          this.menuSections$.next(menuSections);
          this.homeSections$.next(homeSections);
        }
      }
    );
  }

  private buildSysAdminMenu(authState: AuthState, showText): Array<MenuSection> {
    const sections: Array<MenuSection> = [];
    sections.push(
      {
        id: guid(),
        name: 'home.home',
        type: 'link',
        path: '/home',
        icon: 'home',
        showText,
      },
      {
        id: guid(),
        name: 'tenant.tenants',
        type: 'link',
        path: '/tenants',
        icon: 'supervisor_account',
        showText,
      },
      {
        id: guid(),
        name: 'tenant-profile.tenant-profiles',
        type: 'link',
        path: '/tenantProfiles',
        icon: 'mdi:alpha-t-box',
        isMdiIcon: true,
        showText,
      },
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
        name: 'admin.system-settings',
        type: 'toggle',
        path: '/settings',
        height: '240px',
        icon: 'settings',
        showText,
        pages: [
          {
            id: guid(),
            name: 'admin.general',
            type: 'link',
            path: '/settings/general',
            icon: 'settings_applications',
            showText,
          },
          {
            id: guid(),
            name: 'admin.outgoing-mail',
            type: 'link',
            path: '/settings/outgoing-mail',
            icon: 'mail',
            showText,
          },
          {
            id: guid(),
            name: 'admin.sms-provider',
            type: 'link',
            path: '/settings/sms-provider',
            icon: 'sms',
            showText,
          },
          {
            id: guid(),
            name: 'admin.security-settings',
            type: 'link',
            path: '/settings/security-settings',
            icon: 'security',
            showText,
          },
          {
            id: guid(),
            name: 'admin.oauth2.oauth2',
            type: 'link',
            path: '/settings/oauth2',
            icon: 'security',
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

  private buildSysAdminHome(authState: AuthState, showText): Array<HomeSection> {
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
        showText,
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
        showText,
      },
      {
        name: 'admin.system-settings',
        showText,
        places: [
          {
            name: 'admin.general',
            icon: 'settings_applications',
            path: '/settings/general',
            showText,
          },
          {
            name: 'admin.outgoing-mail',
            icon: 'mail',
            path: '/settings/outgoing-mail',
            showText,
          },
          {
            name: 'admin.sms-provider',
            icon: 'sms',
            path: '/settings/sms-provider',
            showText,
          },
          {
            name: 'admin.security-settings',
            icon: 'security',
            path: '/settings/security-settings',
            showText,
          },
          {
            name: 'admin.oauth2.oauth2',
            icon: 'security',
            path: '/settings/oauth2',
            showText,
          },
          {
            name: 'resource.resources-library',
            icon: 'folder',
            path: '/settings/resources-library',
            showText,
          }
        ]
      }
    );
    return homeSections;
  }

  private buildTenantAdminMenu(authState: AuthState, showText): Array<MenuSection> {
    const sections: Array<MenuSection> = [];
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
    if (authState.edgesSupportEnabled) {
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

  private buildTenantAdminHome(authState: AuthState, showText): Array<HomeSection> {
    const homeSections: Array<HomeSection> = [];
    homeSections.push(
      {
        name: 'rulechain.management',
        showText,
        places: [
          {
            name: 'rulechain.rulechains',
            icon: 'settings_ethernet',
            path: '/ruleChains',
            showText,
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
            showText,
          }
        ]
      },
      {
        name: 'asset.management',
        showText,
        places: [
          {
            name: 'asset.assets',
            icon: 'domain',
            path: '/assets',
            showText,
          }
        ]
      },
      {
        name: 'device.management',
        showText,
        places: [
          {
            name: 'device.devices',
            icon: 'devices_other',
            path: '/devices',
            showText,
          },
          {
            name: 'device-profile.device-profiles',
            icon: 'mdi:alpha-d-box',
            isMdiIcon: true,
            path: '/deviceProfiles',
            showText,
          },
          {
            name: 'ota-update.ota-updates',
            icon: 'memory',
            path: '/otaUpdates',
            showText,
          }
        ]
      },
      {
        name: 'entity-view.management',
        showText,
        places: [
          {
            name: 'entity-view.entity-views',
            icon: 'view_quilt',
            path: '/entityViews',
            showText,
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
        showText,
        places: [
          {
            name: 'widget.widget-library',
            icon: 'now_widgets',
            path: '/widgets-bundles',
            showText,
          },
          {
            name: 'dashboard.dashboards',
            icon: 'dashboard',
            path: '/dashboards',
            showText,
          }
        ]
      },
      {
        name: 'audit-log.audit',
        showText,
        places: [
          {
            name: 'audit-log.audit-logs',
            icon: 'track_changes',
            path: '/auditLogs',
            showText,
          },
          {
            name: 'api-usage.api-usage',
            icon: 'insert_chart',
            path: '/usage',
            showText,
          }
        ]
      },
      {
        name: 'admin.system-settings',
        showText,
        places: [
          {
            name: 'admin.home-settings',
            icon: 'settings_applications',
            path: '/settings/home',
            showText,
          },
          {
            name: 'resource.resources-library',
            icon: 'folder',
            path: '/settings/resources-library',
            showText,
          }
        ]
      }
    );
    return homeSections;
  }

  private buildCustomerUserMenu(authState: AuthState, showText): Array<MenuSection> {
    const sections: Array<MenuSection> = [];
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
        name: 'entity-view.entity-views',
        type: 'link',
        path: '/entityViews',
        icon: 'view_quilt',
        showText,
      }
    );
    if (authState.edgesSupportEnabled) {
      sections.push(
        {
          id: guid(),
          name: 'edge.edge-instances',
          type: 'link',
          path: '/edgeInstances',
          icon: 'router',
          showText,
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
        showText,
      }
    );
    return sections;
  }

  private buildCustomerUserHome(authState: AuthState, showText): Array<HomeSection> {
    const homeSections: Array<HomeSection> = [];
    homeSections.push(
      {
        name: 'asset.view-assets',
        showText,
        places: [
          {
            name: 'asset.assets',
            icon: 'domain',
            path: '/assets',
            showText,
          }
        ]
      },
      {
        name: 'device.view-devices',
        showText,
        places: [
          {
            name: 'device.devices',
            icon: 'devices_other',
            path: '/devices',
            showText,
          }
        ]
      },
      {
        name: 'entity-view.management',
        showText,
        places: [
          {
            name: 'entity-view.entity-views',
            icon: 'view_quilt',
            path: '/entityViews',
            showText,
          }
        ]
      }
    );
    if (authState.edgesSupportEnabled) {
      homeSections.push(
        {
          name: 'edge.management',
          showText,
          places: [
            {
              name: 'edge.edge-instances',
              icon: 'settings_input_antenna',
              path: '/edgeInstances',
              showText,
            }
          ]
        }
      );
    }
    homeSections.push(
      {
        name: 'dashboard.view-dashboards',
        showText,
        places: [
          {
            name: 'dashboard.dashboards',
            icon: 'dashboard',
            path: '/dashboards',
            showText,
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

  public updateShowText(showText: boolean) {
    this.showText$.next(showText);
  }

}

