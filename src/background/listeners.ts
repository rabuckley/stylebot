import ContextMenu from './contextmenu';
import BrowserAction from './browseraction';

import BackgroundPageStyles from './styles';

import styleRequest from './requests/styleRequest';
import optionRequest from './requests/optionRequest';
import browserActionRequest from './requests/browserActionRequest';
import copyToClipboardRequest from './requests/copyToClipboardRequest';

import {
  StylebotOptions,
  BackgroundPageRequest,
  BackgroundPageResponse,
} from '../types';

/**
 * Initialize listeners for the background page
 */
const init = (styles: BackgroundPageStyles, options: StylebotOptions) => {
  chrome.extension.onRequest.addListener(
    (
      request: BackgroundPageRequest,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: BackgroundPageResponse) => void
    ) => {
      if (request.name === 'copyToClipboard') {
        copyToClipboardRequest(request);
        return;
      }

      if (
        request.name === 'activateBrowserAction' ||
        request.name === 'highlightBrowserAction' ||
        request.name === 'unhighlightBrowserAction'
      ) {
        browserActionRequest(request, sender);
        return;
      }

      if (
        request.name === 'getOption' ||
        request.name === 'setOption' ||
        request.name === 'getAllOptions' ||
        request.name === 'viewOptionsPage'
      ) {
        optionRequest(request, options, sendResponse);
        return;
      }

      if (
        request.name === 'setStyle' ||
        request.name === 'moveStyles' ||
        request.name === 'getAllStyles' ||
        request.name === 'setAllStyles' ||
        request.name === 'getStylesForPage' ||
        request.name === 'getMergedCssAndUrlForPage' ||
        request.name === 'getMergedCssAndUrlForIframe' ||
        request.name === 'enableStyle' ||
        request.name === 'disableStyle'
      ) {
        styleRequest(request, styles, sender, sendResponse);
        return;
      }
    }
  );

  /**
   * Listen when an existing tab is updated
   * and update the context-menu and browser-action
   */
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (tab.status === 'complete') {
      if (options.contextMenu) {
        ContextMenu.update(tab);
      }
    }

    if (changeInfo.url) {
      BrowserAction.update(tab);
    }
  });

  /**
   * Listen when a tab is activated to update the context-menu
   */
  chrome.tabs.onActivated.addListener(activeInfo => {
    if (options.contextMenu) {
      chrome.tabs.get(activeInfo.tabId, tab => {
        ContextMenu.update(tab);
      });
    }
  });

  /**
   * Listen when a tab is removed to clear its related cache
   */
  chrome.tabs.onRemoved.addListener(tabId => {
    if (window.cache.loadingTabs[tabId]) {
      delete window.cache.loadingTabs[tabId];
    }
  });
};

export default { init };
