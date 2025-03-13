import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

import withNLS from '@shared/HOC/withNLS';

import StaffLanding from '@mws/ui/features/StaffLanding';

import { MWS_SSO_MODE, MWS_TABLET_MODE } from '~/context/actions';
import { CHANNEL_OHCC, FAST_UPDATE_MENU, IS_STUB_MENU_ENV, SSO_LOGON_KEY } from '~/data/constants';
import { DEFAULT_COUNTRY, SSO_MODEL } from '~/data/defaults';
import { urlPrefix } from '/data/routes';
import '~/hooks/LiveChat/LiveChat';
import { getHubMatrix, getHubMenu, retrieveStaffMapping } from '~/lib/api';
import Login from '~/ui/page/Login';
import { BG_COLOR, MY_WORKSPACE } from '~/ui/page/Login/constants';
import Logoff from '~/ui/page/Logoff';
import {
    getAllHubUser,
    getAllProductList,
    getClassificationList,
    getCurrency,
    getIDType,
    getRMList,
    setDefaultCurrency,
} from '-/util/getRefData';
import isBrowser from '~/util/isBrowser';
import HappyJourney from '~/util/loadable';
import Loading from '~/util/loadable/HappyLoading';
import updateMenu, { createStubMenuData } from '~/util/updateMenu';
import updateVerificationMatrix, {
    createVerificationMatrix,
    mergeVerificationMatrix,
} from '~/util/updateVerificationMatrix';

import UnAuth from './UnAuth';
import { PAGE_STATUES } from './constants';
import nls from './nls/strings_nls';
import { getoidcToken } from '../../../util/iKnowConnectivity';
import SamlCallback from '../../../util/iKnowConnectivity/samlCallback';

// import ssoFormatResponse from './sso/formatResponse';
// import ssoCreateMenuData from './sso/createMenuData';

const LoginComponent = HappyJourney(Login);
const LogoffComponent = HappyJourney(Logoff);

const getMenu = getHubMenu();
const getMatrix = getHubMatrix();
const getStaffMaooing = retrieveStaffMapping();
// const getAdGroup = generateAPI('getAdGroup');

const dispatchLiveChat = () => {
  const LiveChat = window.MWS_LIVE_CHAT_SDK?.LiveChat;
  if (window.name.endsWith(LiveChat.SYMBOL)) {
    LiveChat?.getInstance()?.getLatestMessage();
  }
};

const Home = ((NLS, ...props)) => {
  const { channelContext, routerState, channelContextDispatch } = props;
  const fromPageStatus = routerState?.route?.payload?.pageStatus;
  const loadingOptions = useLoading(NLS);
  const [staffInfo, setStaffInfo] = useStaffInfo();
  const pageStatus = usePageStatus(staffInfo, channelContext, fromPageStatus);
  const [accessToken, setAccessToken] = useState('');
  const [idToken, setIdToken] = useState('');
  const [error, setError] = useState('');

  useSSOLogin(pageStatus, channelContextDispatch);
  useTablet(pageStatus, channelContextDispatch);
  useLogin(pageStatus, idToken, setIdToken, accessToken, setAccessToken, error, setError);

  const skipHubLogOn = useCallback(() => {
    setStaffInfo((state) => ({ ...state, hostId: [] }));
  }, [setStaffInfo]);
  
  if (pageStatus === PAGE_STATUES.unauth) {
    return <UnAuth data={staffInfo} />;
  }

  return (
    <>
      {pageStatus === PAGE_STATUES.logoff &&
        ReactDOM.createPortal(
          <LogoffComponent {...props} backgroundColor={BG_COLOR} />,
          document.getElementById(MY_WORKSPACE)
        )}
      {pageStatus === PAGE_STATUES.login &&
        ReactDOM.createPortal(
          <LoginComponent
            {...props}
            staffInfo={staffInfo}
            backgroundColor={BG_COLOR}
            isLoadingDefault={false}
            skipHubLogOn={skipHubLogOn}
          />,
          document.getElementById(MY_WORKSPACE)
        )}
    </>
  );
};

93    const Home = ({ nls, ...props }) => {
94      return (
95        
96        {pageStatus === PAGE_STATUS.loading && <Loading {...loadingOptions} />, document.getElementById(MY_WORKSPACE)}
97        <ReactDOM.createPortal(<Loading {...loadingOptions} />, document.getElementById(MY_WORKSPACE))/>
98        <StaffLanding {...props} />
99        
100   );
101  };
102
103  export default withNLS(nls)(Home);
104
105  export function useTablet(pageStatus, channelContextDispatch) {
106    useEffect(() => {
107      if (pageStatus !== PAGE_STATUS.tablet) {
108        return;
109      }
110      void (async function () {
111        const data = await createStubMenuData();
112        await dispatchMenu(data);
113        updateVerificationMatrix(mergeVerificationMatrix());
114        channelContextDispatch({ type: MWS_TABLET_MODE });
115        dispatchLiveChat();
116      })();
117      // eslint-disable-next-line react-hooks/exhaustive-deps
118    }, [pageStatus]);
119  }
120
121  function usePageStatus(staffInfo, channelContext, from) {
122    return useMemo(() => {
123      function isSSO() {
124        if (SSO_MODEL) {
125          const result = staffInfo?.hostId?.filter?.((item) => item?.slice?.(0, 2) === DEFAULT_COUNTRY) || [];
126          return result.length || channelContext[SSO_LOGON_KEY];
127        }
128        return false;
129      }
130
131      if (from != null && from !== void 0) {
132        return from;
133      }
134      if (isBrowser()) {
135        return PAGE_STATUS.tablet;
136      }
137      if (staffInfo?.errorInfo) {
138        return PAGE_STATUS.unauth;
139      }
140      if (!staffInfo) {
141        return PAGE_STATUS.initial;
142      }
143      if(isSSO()){
           return PAGE_STATUES.sso;
        } else if (!channelContext.userData) {
  return PAGE_STATUES.login;
}
return PAGE_STATUES.default;
},[staffInfo, channelContext, from]);
}

function useSSOLogin(pageStatus, channelContextDispatch) {
  useEffect(() => {
    if (pageStatus === PAGE_STATUES.sso) {
      void (async function() {
        // const data = ssoCreateMenuData(ssoFormatResponse(adGroup));
        // await dispatchMenu(data);
        // updateVerificationMatrix(createVerificationMatrix());
        const data = IS_STUB_MENU_NEW ? await createStubMenuData() : await getMenu({ timestamp: Date.now()});
        await dispatchedMenu(data);
        const matrix = await getMatrix({ timestamp: Date.now() });
        if (matrix && !matrix.errorInfo) {
          updateVerificationMatrix(mergeVerificationMatrix(matrix));
        }
        channelContextDispatch({ type: MWS_SSO_MODE, payload: { [SSO_LOGON_KEY]: true } });
        dispatchLiveChat();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageStatus]); 
  // use550Styles(pageStatus);

  function useStaffInfo() {
    const STAFF_INFO = "staffInfo";
    const [info, setInfo] = useState(JSON.parse(sessionStorage.getItem(STAFF_INFO)));
    useEffect(() => {
      if (info) {
        void (async function() {
          const res = await getStaffMapping().catch(() => null);
          if (!res || res?.errorInfo) {
            setInfo(res);
            return;
          }
          sessionStorage.setItem(STAFF_INFO, JSON.stringify(res));
          setInfo(res);
        })();
      }
      //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return [info, setInfo];
  }
}

async function fetchToken(idToken, setIdToken, accessToken, setAccessToken, error, setError) {
  console.log("FETCH TOKEN")
  const fetchTokens = async () => {
    const tokens = await getoidcToken("samlAssertion");
    if (tokens) {
      setIdToken(tokens.id_token);
      setAccessToken(tokens.access_token);
      setError(''); // Clears any previous errors
    } else {
      setError('Failed to obtain OIDC token.');
    }
  };
  fetchTokens();
  return [idToken, accessToken, error];
}

export function useLogin(pageStatus, idToken, setIdToken, accessToken, setAccessToken, error, setError) {
  useEffect(() => {
    if (pageStatus === PAGE_STATUES.login) {
      history.pushState(null, 'Login', `${urlPrefix}/logins${location.search}`);
    } else if (pageStatus === PAGE_STATUES.default) {
      history.back();
    } else if ([PAGE_STATUES.SSO, PAGE_STATUES.tablet].includes(pageStatus)) {
      history.pushState(null, 'Home', `${urlPrefix}/home${window.location.search}`);
    }
  }, [pageStatus]);

  useEffect(() => {
    if (pageStatus === PAGE_STATUES.default) {
      void (async function() {
        getCurrency();
        getIDType();
        getRMList();
        getAllHubUser();
        setDefaultCurrency();
        getClassificationList();
        await setMenu();
        setMatrix();
        getAllProductList();
        console.info('login success!');
        await fetchToken(idToken, setIdToken, accessToken, setAccessToken, error, setError);
        await focusTabHome();
        dispatchLiveChat();
      })();
    }

function focusTabHome() {
    return new Promise((resolve) => {
      const hom = document.getElementById('tab-hom');
      setTimeout(() => {
        pageStatus === PAGE_STATUSES.default && hom?.blur?.();
      setTimeout(() => {
        pageStatus === PAGE_STATUSES.default && hom?.focus();
        resolve();
      }, 100);
      }, 100);
    });
  }

  async function setMenu() {
    try {
      const data = IS_STUB_MENU_ENV ? createStubMenuData() : await getMenu({ timeStamp: Date.now() });
      dispatchMenu(menu);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
  }

  async function setMatrix() {
    try {
      const matrix = await getMatrix({ timeStamp: Date.now() });
      if (matrix?.errorInfo) {
        mockVerificationInfo();
      } else if(matrix) {
        updateVerificationMatrix(mergeVerificationMatrix(matrix));
      } else {
        //eslint-disable-next-line no-console
        console.error('api getMatrix error ==>', matrix);
        mockVerification();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('api getMatrix Service Error ==> ', e);
      // eslint-disable-next-line no-console
      console.warn(e);
      mockVerification();
    }
  }
  }, [pageStatus]);
}

function mockVerification() {
    !isCallCenter() && updateVerificationMatrix(createVerificationMatrix());
}

function isCallCenter() {
    const channelContext = JSON.parse(sessionStorage.getItem('channelContext')) || {};
    return channelContext?.consumerChannelContext?.channelId === CHANNEL_OHCC;
}

function useLoading(NLS) {
    return useMemo(() => {
        return { loading: { run: true, text: NLS 'loading' } };
    }, [NLS]);
}

async function dispatchMenu(menuData) {
    if (menuData) {
        sessionStorage.setItem(FAST_UPDATE_MENU, true);
        await updateMenu(menuData);
        setTimeout(() => {
            updateMenu(menuData);
        });
    } else {
        // eslint-disable-next-line no-console
        console.error("api getMenu Error -->", menuData);
    }
}
