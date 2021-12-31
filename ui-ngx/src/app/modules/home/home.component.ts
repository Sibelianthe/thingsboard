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

import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { User } from '@shared/models/user.model';
import { PageComponent } from '@shared/components/page.component';
import { AppState } from '@core/core.state';
import { getCurrentAuthState, selectAuthUser, selectUserDetails } from '@core/auth/auth.selectors';
import { MediaBreakpoints } from '@shared/models/constants';
import * as _screenfull from 'screenfull';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthState } from '@core/auth/auth.models';
import { WINDOW } from '@core/services/window.service';
import { AttributeService } from '@core/http/attribute.service';
import { instanceOfSearchableComponent, ISearchableComponent } from '@home/models/searchable-component.models';
import { AttributeScope } from "@shared/models/telemetry/telemetry.models";
import { EntityId } from '@shared/models/id/entity-id';
import { EntityType } from '@app/shared/public-api';
import { MenuService } from '@app/core/public-api';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

const screenfull = _screenfull as _screenfull.Screenfull;

@Component({
  selector: 'tb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends PageComponent implements AfterViewInit, OnInit {

  authState: AuthState = getCurrentAuthState(this.store);

  forceFullscreen = this.authState.forceFullscreen;

  activeComponent: any;
  searchableComponent: ISearchableComponent;

  sidenavMode: 'over' | 'push' | 'side' = 'side';
  sidenavOpened = true;

  logo ='assets/LogoMySMartProcess.svg';
  favicon: SafeUrl = 'assets/favicon.ico';
  whiteLabelingKeys = {
    logo: 'Logo',
    favicon: 'favicon',
    primaryPalette: 'prim',
    accentPalette: 'acc',
    warnPalette: 'warn',
    darkText: 'darkText',
    lightText: 'lightText',
  };

  @ViewChild('sidenav')
  sidenav: MatSidenav;

  @ViewChild('searchInput') searchInputField: ElementRef;

  fullscreenEnabled = screenfull.isEnabled;

  authUser$: Observable<any>;
  userDetails$: Observable<User>;
  userDetailsString: Observable<string>;

  searchEnabled = false;
  showSearch = false;
  searchText = '';

  showText = true;

  constructor(protected store: Store<AppState>,
              private attributeService: AttributeService,
              @Inject(WINDOW) private window: Window,
              public breakpointObserver: BreakpointObserver,
              private menuService: MenuService,
              private sanitizer:DomSanitizer) {
    super(store);
  }
  
  updateShowText() {
    this.menuService.showText$.next(!this.showText)
  }


  ngOnInit() {

    this.menuService.showText$.subscribe(showText => this.showText = showText)
    this.authUser$ = this.store.pipe(select(selectAuthUser));
    this.userDetails$ = this.store.pipe(select(selectUserDetails));
    this.userDetailsString = this.userDetails$.pipe(map((user: User) => {
      return JSON.stringify(user);
    }));

    this.authUser$.subscribe(user => {
      if (user && ['TENANT_ADMIN', 'CUSTOMER_USER'].includes(user.scopes[0])) {
        let entity: EntityId = { entityType: EntityType.TENANT, id: ''};
        if (user.scopes.includes('TENANT_ADMIN')) {
          entity.id = user.tenantId;
        } else if (user.scopes.includes('CUSTOMER_USER')) {
          entity.entityType = EntityType.CUSTOMER;
          entity.id = user.customerId;
        }
        this.attributeService.getEntityAttributes(entity, AttributeScope.SERVER_SCOPE, Object.values(this.whiteLabelingKeys)).subscribe( attrs => {
          const logo = attrs.find(e => e.key === this.whiteLabelingKeys.logo)?.value
          if (logo) this.logo = logo;
          const favicon = attrs.find(e => e.key === this.whiteLabelingKeys.favicon)?.value
          const faviconTag = document.getElementById('favicon')
          if (favicon && faviconTag) {
            faviconTag.setAttribute('href', favicon);
            this.favicon = this.sanitizer.bypassSecurityTrustUrl(favicon)
          }
          
          const darkTextColor = attrs.find(e => e.key === this.whiteLabelingKeys.darkText)?.value
          if (darkTextColor) document.documentElement.style.setProperty('--dark-text', darkTextColor);

          const lightTextColor = attrs.find(e => e.key === this.whiteLabelingKeys.lightText)?.value
          if (lightTextColor) document.documentElement.style.setProperty('--light-text', lightTextColor);

          const primaryPalette = attrs.find(e => e.key === this.whiteLabelingKeys.primaryPalette)?.value
          if (primaryPalette) this.setPalette(JSON.parse(primaryPalette), 'prim');
          
          const accentPalette = attrs.find(e => e.key === this.whiteLabelingKeys.accentPalette)?.value
          if (accentPalette) this.setPalette(JSON.parse(accentPalette), 'acc');
          
          const warnPalette = attrs.find(e => e.key === this.whiteLabelingKeys.warnPalette)?.value
          if (warnPalette) this.setPalette(JSON.parse(warnPalette), 'warn');

        }, err => {
          console.warn('Customer has no SERVER_SCOPE attributes', err);
        });
      }
    })


    const isGtSm = this.breakpointObserver.isMatched(MediaBreakpoints['gt-sm']);
    this.sidenavMode = isGtSm ? 'side' : 'over';
    this.sidenavOpened = isGtSm;

    this.breakpointObserver
      .observe(MediaBreakpoints['gt-sm'])
      .subscribe((state: BreakpointState) => {
          if (state.matches) {
            this.sidenavMode = 'side';
            this.sidenavOpened = true;
          } else {
            this.sidenavMode = 'over';
            this.sidenavOpened = false;
          }
        }
      );
  }

  ngAfterViewInit() {
    fromEvent(this.searchInputField.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.searchTextUpdated();
        })
      )
      .subscribe();
  }

  sidenavClicked() {
    if (this.sidenavMode === 'over') {
      this.sidenav.toggle();
    }
  }

  toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }

  isFullscreen() {
    return screenfull.isFullscreen;
  }

  goBack() {
    this.window.history.back();
  }

  activeComponentChanged(activeComponent: any) {
    this.showSearch = false;
    this.searchText = '';
    this.activeComponent = activeComponent;
    if (this.activeComponent && instanceOfSearchableComponent(this.activeComponent)) {
      this.searchEnabled = true;
      this.searchableComponent = this.activeComponent;
    } else {
      this.searchEnabled = false;
      this.searchableComponent = null;
    }
  }

  displaySearchMode(): boolean {
    return this.searchEnabled && this.showSearch;
  }

  openSearch() {
    if (this.searchEnabled) {
      this.showSearch = true;
      setTimeout(() => {
        this.searchInputField.nativeElement.focus();
        this.searchInputField.nativeElement.setSelectionRange(0, 0);
      }, 10);
    }
  }

  closeSearch() {
    if (this.searchEnabled) {
      this.showSearch = false;
      if (this.searchText.length) {
        this.searchText = '';
        this.searchTextUpdated();
      }
    }
  }

  private searchTextUpdated() {
    if (this.searchableComponent) {
      this.searchableComponent.onSearchTextUpdated(this.searchText);
    }
  }

  private setPalette(palette, name) {
    const darkTextColor = getComputedStyle(document.documentElement).getPropertyValue('--dark-text');
    const lightTextColor = getComputedStyle(document.documentElement).getPropertyValue('--light-text');
    for (let color of palette) {
      
      // Construct the variable name from palette name + color tint
      const cssVarName = `--${name}-${color.name}`;

      // Set the variable to its value
      document.documentElement.style.setProperty(cssVarName, color.hex);

      // Check if contrast is dark or light
      let textColor = lightTextColor;
      if (color.darkContrast === true) {
        textColor = darkTextColor;
      }
      document.documentElement.style.setProperty(cssVarName + '-text', textColor);

    }
  }
}
