import React, { MouseEvent, useCallback, useRef, useState } from 'react';
import './Header.scss';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { NavLink } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import GllacyLogo from '../../atoms/GllacyLogo';
import Cross from '../../../assets/svg/cross';
import ToggleMenu from '../../../assets/svg/toggle-menu';
import LangToggle from '../../atoms/LangToggle';
import Popup from '../Popup';
import SignInTile from '../../molecules/SignInTile';
import LogIn from '../../../assets/svg/log-in';
import Cart from '../../../assets/svg/cart';
import CartTile from '../../molecules/CartTile';
import cartStore, { ICartStore } from '../../molecules/CartTile/Cart.store';
import { activeIndexSelector, ISliderTileStore, useSliderTileStore } from '../../atoms/SliderTile/SliderTile.store';
import useClickOutside from '../../utils/useClickOutside';

export interface IBasicNavigationItem {
  /** Displayed name of the navigation item */
  name: string;
  /** Link of the navigation item */
  link: string;
}

interface IHeader {
  /** Basic Navigation List Data for a page */
  basicNavigationArray: IBasicNavigationItem[];
  /** Technical attributes */
  'data-testid': string;
}

const Header = ({ basicNavigationArray, 'data-testid': testId }: IHeader) => {
  const { t } = useTranslation();

  const headerRef = useRef<HTMLHeadElement>(null);
  const navigationContainerRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  const [isClosed, setIsClosed] = useState(true);

  const menuToggleText = isClosed ? t('toggleOpenMenu') : t('toggleCloseMenu');

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `navigation__link ${isActive ? 'navigation__link--active' : ''}`;

  const onMenuToggleHandler = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      setIsClosed(!isClosed);
    },
    [isClosed]
  );

  useClickOutside(
    navigationContainerRef.current,
    () => {
      setIsClosed(true);
    },
    !isClosed,
    menuToggleRef.current
  );

  const basicNavigation = basicNavigationArray.map((item) => {
    const { name, link } = item;
    return (
      <li key={name} className={cx('navigation__basic-item')}>
        <NavLink className={linkClassName} to={link} onClick={onMenuToggleHandler}>
          {t(name)}
        </NavLink>
      </li>
    );
  });

  const productList = cartStore((store: ICartStore) => store.productList, shallow);

  const cartItemsNumber = Object.keys(productList).length;

  const cartButtonName = cartItemsNumber === 0 ? 'cart' : `${cartItemsNumber} ${t('itemsNumber')}`;

  const { activeItemIndex } = useSliderTileStore(activeIndexSelector, shallow);
  const offers = useSliderTileStore((store: ISliderTileStore) => store.offers, shallow);

  const { backgroundColor } = offers[activeItemIndex];
  return (
    <header className="header" ref={headerRef}>
      <GllacyLogo data-testid={testId} />
      <nav className={cx('header__navigation', 'navigation', isClosed && 'navigation--closed')}>
        <button
          className="navigation__menu-toggle"
          ref={menuToggleRef}
          type="button"
          onClick={onMenuToggleHandler}
          data-testid={`${testId}-menu-toggle`}
        >
          <span className="visually-hidden">{menuToggleText}</span>
          {!isClosed && <Cross data-testid={`${testId}-cross-icon`} />}
          {isClosed && <ToggleMenu />}
        </button>
        <div
          className="navigation__container"
          ref={navigationContainerRef}
          style={{ top: headerRef.current?.clientHeight || 0, backgroundColor: `var(--special-${backgroundColor})` }}
        >
          <ul className="navigation__basic-list">{basicNavigation}</ul>
          <a href="tel:+9203333424" className="navigation__phone">
            +1-920-333-3424
          </a>
          <LangToggle className="navigation__language-toggle" data-testid={testId} />
          <ul className="navigation__user-list">
            <li className="navigation__user-item">
              <Popup
                data-testid={`${testId}-popup-signIn`}
                openingButtonIcon={<LogIn />}
                openingButtonText={t('signInButton')}
              >
                <SignInTile data-testid={testId} />
              </Popup>
            </li>
            <li className="navigation__user-item">
              <Popup
                data-testid={`${testId}-popup-cart`}
                openingButtonIcon={<Cart />}
                openingButtonText={cartButtonName}
              >
                <CartTile data-testid={testId} />
              </Popup>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
