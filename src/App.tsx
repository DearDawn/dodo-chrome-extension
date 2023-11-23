import React from 'react';
import * as styles from './App.module.less';
import clsx from 'clsx';
import dayjs from 'dayjs';

const STORAGE_KEY = 'dodo-chrome-extension';
const CardItemIDPrefix = `${STORAGE_KEY}-card-item`;

type IDomHtmlItem = {
  html?: string;
  id?: string;
  date?: number;
};

const EmptyItem: IDomHtmlItem = { html: '', id: '', date: 0 };

export const App = () => {
  const [visible, setVisible] = React.useState(false);
  const [cardList, setCardList] = React.useState<IDomHtmlItem[]>([]);
  const toggleVisible = () => setVisible((vis) => !vis);
  const init = React.useRef(true);
  const error = React.useRef(false);

  const getDomHtmlList = () => {
    const htmlList = Array.from(
      document.getElementsByClassName(styles.card)
    ).map((it) => ({
      html: it.innerHTML.trim(),
      id: it.id,
      date: Number(it.getAttribute('data-date')) || dayjs().unix(),
    }));

    return htmlList;
  };

  /** 存当前的数据 */
  const saveList = React.useCallback(() => {
    const htmlList = getDomHtmlList().filter((it) => !!it.html);
    // console.log('[dodo] ', 'htmlList', htmlList);

    chrome.storage.local.set({
      [STORAGE_KEY]: JSON.stringify(htmlList),
    });
  }, []);

  // 点击 Icon 时触发显示隐藏
  React.useEffect(() => {
    if (!chrome?.runtime) return;

    const cb = (res = { action: 'click' }) => {
      setVisible((_vis) => !_vis);
      return undefined;
    };

    chrome.runtime.onMessage.addListener(cb);

    return () => {
      chrome.runtime.onMessage.removeListener(cb);
    };
  }, []);

  // 数据存取
  React.useEffect(() => {
    if (!chrome?.storage) return;

    // 关闭时存数据
    if (!visible) {
      if (init.current || error.current) {
        init.current = false;
        return;
      }
      saveList();
      return;
    }

    // 显示时更新数据
    chrome.storage.local.get(STORAGE_KEY).then((res) => {
      try {
        const htmlStr = res[STORAGE_KEY] || '';
        const htmlList = JSON.parse(htmlStr) || [];
        // console.log('[dodo] ', 'htmlList', htmlList);
        setCardList(htmlList);
        const lastID = `${CardItemIDPrefix}-${htmlList.length}`;
        setTimeout(() => {
          document.getElementById(lastID)?.focus();
        }, 150);
        error.current = false;
      } catch (error) {
        // console.log('[dodo] ', 'error', error);
        error.current = true;
      }
    });
  }, [visible]);

  // 其他页面数据改变时，更新当前数据

  React.useEffect(() => {
    if (!chrome.storage) return;

    const cb = (res: { [name: string]: chrome.storage.StorageChange }) => {
      try {
        const htmlStr = res[STORAGE_KEY].newValue || '';
        const htmlList = JSON.parse(htmlStr) || [];
        const domHtmlList = getDomHtmlList();
        const lastDomHtml = domHtmlList[domHtmlList.length - 1];
        if (lastDomHtml?.html.trim()) {
          htmlList.push(lastDomHtml);
        }

        setCardList(htmlList);
        error.current = false;
      } catch (error) {
        // console.log('[dodo] ', 'error', error);
        error.current = true;
      }
    };

    chrome.storage.local.onChanged.addListener(cb);

    return () => {
      chrome.storage.local.onChanged.removeListener(cb);
    };
  }, []);

  React.useEffect(() => {
    const cb = () => {
      const isVisible = document.visibilityState === 'visible';

      if (!isVisible) {
        saveList();
      }
    };
    document.addEventListener('visibilitychange', cb);

    return () => {
      document.removeEventListener('visibilitychange', cb);
    };
  }, []);

  return (
    <>
      <div className={clsx(styles.mask, visible && styles.visible)} />
      <div className={clsx(styles.drawer, visible && styles.visible)}>
        {/* <div className={styles.toggle} onClick={toggleVisible} /> */}
        <div className={styles.cardList}>
          {cardList.concat(EmptyItem).map((it, index) => (
            <div className={styles.cardWrap}>
              <div
                id={`${CardItemIDPrefix}-${index}`}
                key={index}
                data-date={it.date || 0}
                className={styles.card}
                contentEditable
                dangerouslySetInnerHTML={{ __html: it.html || '' }}
                draggable
                onDrop={(e) => e.preventDefault()}
              />
              {!!it.date && (
                <div className={styles.date}>
                  {dayjs.unix(it.date).format('MM-DD HH:mm:ss')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
