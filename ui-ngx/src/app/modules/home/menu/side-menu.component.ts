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

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MenuService } from '@core/services/menu.service';
import { MenuSection } from '@core/services/menu.models';
import { AttributeService } from '@app/core/public-api';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { AttributeScope, EntityType, PageComponent } from '@app/shared/public-api';
import { EntityId } from '@shared/models/id/entity-id';
import { selectAuthUser } from '@core/auth/auth.selectors';

@Component({
  selector: 'tb-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent extends PageComponent implements OnInit {

  menuSections$ = this.menuService.menuSections();
  authUser$: Observable<any>;

  constructor(protected store: Store<AppState>, private menuService: MenuService, private attributeService: AttributeService) {
    super(store);
  }

  trackByMenuSection(index: number, section: MenuSection){
    return section.id;
  }

  ngOnInit() {
    this.authUser$ = this.store.pipe(select(selectAuthUser));
    this.authUser$.subscribe(async user => {
      if (user && ['TENANT_ADMIN', 'CUSTOMER_USER'].includes(user.scopes[0])) {
        let entity: EntityId = { id: user.tenantId, entityType: EntityType.TENANT };
        if (user.scopes.includes('CUSTOMER_USER')) {
          entity.entityType = EntityType.CUSTOMER;
          entity.id = user.customerId;
        }
        // try to set global custom menu depending on user type
        await this.getCustomMenu(entity);

        // try to set particular user's custom menu
        // could be optimzed to run first and only then see if user has global settings ...
        // by piping subscriptions ??
        entity.entityType = EntityType.USER;
        entity.id = user.userId;
        await this.getCustomMenu(entity);
      }
    })
  }

  async getCustomMenu(entity, menuAttributeName = 'custom_menu') {
      return this.attributeService.getEntityAttributes(entity, AttributeScope.SERVER_SCOPE, [menuAttributeName]).subscribe( attrs => {
        const customMenuJson = attrs.find(e => e.key === menuAttributeName)?.value
        if (customMenuJson) {
          try {
            const menu = JSON.parse(customMenuJson)
            this.menuService.updateMenuSection(menu)
            this.menuService.updateHomeSection(menu)
            return Promise.resolve(true);
          } catch (err) {
            console.error(err)
            return Promise.resolve(false);
          }
        }
        return Promise.resolve(false);
      }, err => {
        console.warn('Customer has no SERVER_SCOPE attributes', err);
        return Promise.resolve(false);
      })
  }
}
