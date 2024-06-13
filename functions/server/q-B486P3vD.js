import { r as registerVersion, _ as _registerComponent, C as Component, a as _getProvider, E as ErrorFactory, F as FirebaseError, o as openDB, L as Logger, g as getModularInstance, b as getApp, d as deepEqual, i as isBrowserExtension, c as areCookiesEnabled, e as isIndexedDBAvailable, v as validateIndexedDBOpenable, f as calculateBackoffMillis } from "./q-o3suSQYm.js";
import "./q-B0Mda4vz.js";
const name$1 = "@firebase/installations";
const version$1 = "0.6.7";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const PENDING_TIMEOUT_MS = 1e4;
const PACKAGE_VERSION = `w:${version$1}`;
const INTERNAL_AUTH_VERSION = "FIS_v2";
const INSTALLATIONS_API_URL = "https://firebaseinstallations.googleapis.com/v1";
const TOKEN_EXPIRATION_BUFFER = 60 * 60 * 1e3;
const SERVICE = "installations";
const SERVICE_NAME = "Installations";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ERROR_DESCRIPTION_MAP = {
  [
    "missing-app-config-values"
    /* ErrorCode.MISSING_APP_CONFIG_VALUES */
  ]: 'Missing App configuration value: "{$valueName}"',
  [
    "not-registered"
    /* ErrorCode.NOT_REGISTERED */
  ]: "Firebase Installation is not registered.",
  [
    "installation-not-found"
    /* ErrorCode.INSTALLATION_NOT_FOUND */
  ]: "Firebase Installation not found.",
  [
    "request-failed"
    /* ErrorCode.REQUEST_FAILED */
  ]: '{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',
  [
    "app-offline"
    /* ErrorCode.APP_OFFLINE */
  ]: "Could not process request. Application offline.",
  [
    "delete-pending-registration"
    /* ErrorCode.DELETE_PENDING_REGISTRATION */
  ]: "Can't delete installation while there is a pending registration request."
};
const ERROR_FACTORY$1 = new ErrorFactory(SERVICE, SERVICE_NAME, ERROR_DESCRIPTION_MAP);
function isServerError(error) {
  return error instanceof FirebaseError && error.code.includes(
    "request-failed"
    /* ErrorCode.REQUEST_FAILED */
  );
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getInstallationsEndpoint({ projectId }) {
  return `${INSTALLATIONS_API_URL}/projects/${projectId}/installations`;
}
function extractAuthTokenInfoFromResponse(response) {
  return {
    token: response.token,
    requestStatus: 2,
    expiresIn: getExpiresInFromResponseExpiresIn(response.expiresIn),
    creationTime: Date.now()
  };
}
async function getErrorFromResponse(requestName, response) {
  const responseJson = await response.json();
  const errorData = responseJson.error;
  return ERROR_FACTORY$1.create("request-failed", {
    requestName,
    serverCode: errorData.code,
    serverMessage: errorData.message,
    serverStatus: errorData.status
  });
}
function getHeaders$1({ apiKey }) {
  return new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-goog-api-key": apiKey
  });
}
function getHeadersWithAuth(appConfig, { refreshToken }) {
  const headers = getHeaders$1(appConfig);
  headers.append("Authorization", getAuthorizationHeader(refreshToken));
  return headers;
}
async function retryIfServerError(fn) {
  const result = await fn();
  if (result.status >= 500 && result.status < 600) {
    return fn();
  }
  return result;
}
function getExpiresInFromResponseExpiresIn(responseExpiresIn) {
  return Number(responseExpiresIn.replace("s", "000"));
}
function getAuthorizationHeader(refreshToken) {
  return `${INTERNAL_AUTH_VERSION} ${refreshToken}`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function createInstallationRequest({ appConfig, heartbeatServiceProvider }, { fid }) {
  const endpoint = getInstallationsEndpoint(appConfig);
  const headers = getHeaders$1(appConfig);
  const heartbeatService = heartbeatServiceProvider.getImmediate({
    optional: true
  });
  if (heartbeatService) {
    const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
    if (heartbeatsHeader) {
      headers.append("x-firebase-client", heartbeatsHeader);
    }
  }
  const body = {
    fid,
    authVersion: INTERNAL_AUTH_VERSION,
    appId: appConfig.appId,
    sdkVersion: PACKAGE_VERSION
  };
  const request = {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  };
  const response = await retryIfServerError(() => fetch(endpoint, request));
  if (response.ok) {
    const responseValue = await response.json();
    const registeredInstallationEntry = {
      fid: responseValue.fid || fid,
      registrationStatus: 2,
      refreshToken: responseValue.refreshToken,
      authToken: extractAuthTokenInfoFromResponse(responseValue.authToken)
    };
    return registeredInstallationEntry;
  } else {
    throw await getErrorFromResponse("Create Installation", response);
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function bufferToBase64UrlSafe(array) {
  const b64 = btoa(String.fromCharCode(...array));
  return b64.replace(/\+/g, "-").replace(/\//g, "_");
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const VALID_FID_PATTERN = /^[cdef][\w-]{21}$/;
const INVALID_FID = "";
function generateFid() {
  try {
    const fidByteArray = new Uint8Array(17);
    const crypto = self.crypto || self.msCrypto;
    crypto.getRandomValues(fidByteArray);
    fidByteArray[0] = 112 + fidByteArray[0] % 16;
    const fid = encode(fidByteArray);
    return VALID_FID_PATTERN.test(fid) ? fid : INVALID_FID;
  } catch (_a) {
    return INVALID_FID;
  }
}
function encode(fidByteArray) {
  const b64String = bufferToBase64UrlSafe(fidByteArray);
  return b64String.substr(0, 22);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getKey(appConfig) {
  return `${appConfig.appName}!${appConfig.appId}`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fidChangeCallbacks = /* @__PURE__ */ new Map();
function fidChanged(appConfig, fid) {
  const key = getKey(appConfig);
  callFidChangeCallbacks(key, fid);
  broadcastFidChange(key, fid);
}
function callFidChangeCallbacks(key, fid) {
  const callbacks = fidChangeCallbacks.get(key);
  if (!callbacks) {
    return;
  }
  for (const callback of callbacks) {
    callback(fid);
  }
}
function broadcastFidChange(key, fid) {
  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage({ key, fid });
  }
  closeBroadcastChannel();
}
let broadcastChannel = null;
function getBroadcastChannel() {
  if (!broadcastChannel && "BroadcastChannel" in self) {
    broadcastChannel = new BroadcastChannel("[Firebase] FID Change");
    broadcastChannel.onmessage = (e) => {
      callFidChangeCallbacks(e.data.key, e.data.fid);
    };
  }
  return broadcastChannel;
}
function closeBroadcastChannel() {
  if (fidChangeCallbacks.size === 0 && broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DATABASE_NAME = "firebase-installations-database";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "firebase-installations-store";
let dbPromise = null;
function getDbPromise() {
  if (!dbPromise) {
    dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade: (db, oldVersion) => {
        switch (oldVersion) {
          case 0:
            db.createObjectStore(OBJECT_STORE_NAME);
        }
      }
    });
  }
  return dbPromise;
}
async function set(appConfig, value) {
  const key = getKey(appConfig);
  const db = await getDbPromise();
  const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
  const objectStore = tx.objectStore(OBJECT_STORE_NAME);
  const oldValue = await objectStore.get(key);
  await objectStore.put(value, key);
  await tx.done;
  if (!oldValue || oldValue.fid !== value.fid) {
    fidChanged(appConfig, value.fid);
  }
  return value;
}
async function remove(appConfig) {
  const key = getKey(appConfig);
  const db = await getDbPromise();
  const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
  await tx.objectStore(OBJECT_STORE_NAME).delete(key);
  await tx.done;
}
async function update(appConfig, updateFn) {
  const key = getKey(appConfig);
  const db = await getDbPromise();
  const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  const oldValue = await store.get(key);
  const newValue = updateFn(oldValue);
  if (newValue === void 0) {
    await store.delete(key);
  } else {
    await store.put(newValue, key);
  }
  await tx.done;
  if (newValue && (!oldValue || oldValue.fid !== newValue.fid)) {
    fidChanged(appConfig, newValue.fid);
  }
  return newValue;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function getInstallationEntry(installations) {
  let registrationPromise;
  const installationEntry = await update(installations.appConfig, (oldEntry) => {
    const installationEntry2 = updateOrCreateInstallationEntry(oldEntry);
    const entryWithPromise = triggerRegistrationIfNecessary(installations, installationEntry2);
    registrationPromise = entryWithPromise.registrationPromise;
    return entryWithPromise.installationEntry;
  });
  if (installationEntry.fid === INVALID_FID) {
    return { installationEntry: await registrationPromise };
  }
  return {
    installationEntry,
    registrationPromise
  };
}
function updateOrCreateInstallationEntry(oldEntry) {
  const entry = oldEntry || {
    fid: generateFid(),
    registrationStatus: 0
    /* RequestStatus.NOT_STARTED */
  };
  return clearTimedOutRequest(entry);
}
function triggerRegistrationIfNecessary(installations, installationEntry) {
  if (installationEntry.registrationStatus === 0) {
    if (!navigator.onLine) {
      const registrationPromiseWithError = Promise.reject(ERROR_FACTORY$1.create(
        "app-offline"
        /* ErrorCode.APP_OFFLINE */
      ));
      return {
        installationEntry,
        registrationPromise: registrationPromiseWithError
      };
    }
    const inProgressEntry = {
      fid: installationEntry.fid,
      registrationStatus: 1,
      registrationTime: Date.now()
    };
    const registrationPromise = registerInstallation(installations, inProgressEntry);
    return { installationEntry: inProgressEntry, registrationPromise };
  } else if (installationEntry.registrationStatus === 1) {
    return {
      installationEntry,
      registrationPromise: waitUntilFidRegistration(installations)
    };
  } else {
    return { installationEntry };
  }
}
async function registerInstallation(installations, installationEntry) {
  try {
    const registeredInstallationEntry = await createInstallationRequest(installations, installationEntry);
    return set(installations.appConfig, registeredInstallationEntry);
  } catch (e) {
    if (isServerError(e) && e.customData.serverCode === 409) {
      await remove(installations.appConfig);
    } else {
      await set(installations.appConfig, {
        fid: installationEntry.fid,
        registrationStatus: 0
        /* RequestStatus.NOT_STARTED */
      });
    }
    throw e;
  }
}
async function waitUntilFidRegistration(installations) {
  let entry = await updateInstallationRequest(installations.appConfig);
  while (entry.registrationStatus === 1) {
    await sleep(100);
    entry = await updateInstallationRequest(installations.appConfig);
  }
  if (entry.registrationStatus === 0) {
    const { installationEntry, registrationPromise } = await getInstallationEntry(installations);
    if (registrationPromise) {
      return registrationPromise;
    } else {
      return installationEntry;
    }
  }
  return entry;
}
function updateInstallationRequest(appConfig) {
  return update(appConfig, (oldEntry) => {
    if (!oldEntry) {
      throw ERROR_FACTORY$1.create(
        "installation-not-found"
        /* ErrorCode.INSTALLATION_NOT_FOUND */
      );
    }
    return clearTimedOutRequest(oldEntry);
  });
}
function clearTimedOutRequest(entry) {
  if (hasInstallationRequestTimedOut(entry)) {
    return {
      fid: entry.fid,
      registrationStatus: 0
      /* RequestStatus.NOT_STARTED */
    };
  }
  return entry;
}
function hasInstallationRequestTimedOut(installationEntry) {
  return installationEntry.registrationStatus === 1 && installationEntry.registrationTime + PENDING_TIMEOUT_MS < Date.now();
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function generateAuthTokenRequest({ appConfig, heartbeatServiceProvider }, installationEntry) {
  const endpoint = getGenerateAuthTokenEndpoint(appConfig, installationEntry);
  const headers = getHeadersWithAuth(appConfig, installationEntry);
  const heartbeatService = heartbeatServiceProvider.getImmediate({
    optional: true
  });
  if (heartbeatService) {
    const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
    if (heartbeatsHeader) {
      headers.append("x-firebase-client", heartbeatsHeader);
    }
  }
  const body = {
    installation: {
      sdkVersion: PACKAGE_VERSION,
      appId: appConfig.appId
    }
  };
  const request = {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  };
  const response = await retryIfServerError(() => fetch(endpoint, request));
  if (response.ok) {
    const responseValue = await response.json();
    const completedAuthToken = extractAuthTokenInfoFromResponse(responseValue);
    return completedAuthToken;
  } else {
    throw await getErrorFromResponse("Generate Auth Token", response);
  }
}
function getGenerateAuthTokenEndpoint(appConfig, { fid }) {
  return `${getInstallationsEndpoint(appConfig)}/${fid}/authTokens:generate`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function refreshAuthToken(installations, forceRefresh = false) {
  let tokenPromise;
  const entry = await update(installations.appConfig, (oldEntry) => {
    if (!isEntryRegistered(oldEntry)) {
      throw ERROR_FACTORY$1.create(
        "not-registered"
        /* ErrorCode.NOT_REGISTERED */
      );
    }
    const oldAuthToken = oldEntry.authToken;
    if (!forceRefresh && isAuthTokenValid(oldAuthToken)) {
      return oldEntry;
    } else if (oldAuthToken.requestStatus === 1) {
      tokenPromise = waitUntilAuthTokenRequest(installations, forceRefresh);
      return oldEntry;
    } else {
      if (!navigator.onLine) {
        throw ERROR_FACTORY$1.create(
          "app-offline"
          /* ErrorCode.APP_OFFLINE */
        );
      }
      const inProgressEntry = makeAuthTokenRequestInProgressEntry(oldEntry);
      tokenPromise = fetchAuthTokenFromServer(installations, inProgressEntry);
      return inProgressEntry;
    }
  });
  const authToken = tokenPromise ? await tokenPromise : entry.authToken;
  return authToken;
}
async function waitUntilAuthTokenRequest(installations, forceRefresh) {
  let entry = await updateAuthTokenRequest(installations.appConfig);
  while (entry.authToken.requestStatus === 1) {
    await sleep(100);
    entry = await updateAuthTokenRequest(installations.appConfig);
  }
  const authToken = entry.authToken;
  if (authToken.requestStatus === 0) {
    return refreshAuthToken(installations, forceRefresh);
  } else {
    return authToken;
  }
}
function updateAuthTokenRequest(appConfig) {
  return update(appConfig, (oldEntry) => {
    if (!isEntryRegistered(oldEntry)) {
      throw ERROR_FACTORY$1.create(
        "not-registered"
        /* ErrorCode.NOT_REGISTERED */
      );
    }
    const oldAuthToken = oldEntry.authToken;
    if (hasAuthTokenRequestTimedOut(oldAuthToken)) {
      return Object.assign(Object.assign({}, oldEntry), { authToken: {
        requestStatus: 0
        /* RequestStatus.NOT_STARTED */
      } });
    }
    return oldEntry;
  });
}
async function fetchAuthTokenFromServer(installations, installationEntry) {
  try {
    const authToken = await generateAuthTokenRequest(installations, installationEntry);
    const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken });
    await set(installations.appConfig, updatedInstallationEntry);
    return authToken;
  } catch (e) {
    if (isServerError(e) && (e.customData.serverCode === 401 || e.customData.serverCode === 404)) {
      await remove(installations.appConfig);
    } else {
      const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), { authToken: {
        requestStatus: 0
        /* RequestStatus.NOT_STARTED */
      } });
      await set(installations.appConfig, updatedInstallationEntry);
    }
    throw e;
  }
}
function isEntryRegistered(installationEntry) {
  return installationEntry !== void 0 && installationEntry.registrationStatus === 2;
}
function isAuthTokenValid(authToken) {
  return authToken.requestStatus === 2 && !isAuthTokenExpired(authToken);
}
function isAuthTokenExpired(authToken) {
  const now = Date.now();
  return now < authToken.creationTime || authToken.creationTime + authToken.expiresIn < now + TOKEN_EXPIRATION_BUFFER;
}
function makeAuthTokenRequestInProgressEntry(oldEntry) {
  const inProgressAuthToken = {
    requestStatus: 1,
    requestTime: Date.now()
  };
  return Object.assign(Object.assign({}, oldEntry), { authToken: inProgressAuthToken });
}
function hasAuthTokenRequestTimedOut(authToken) {
  return authToken.requestStatus === 1 && authToken.requestTime + PENDING_TIMEOUT_MS < Date.now();
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function getId(installations) {
  const installationsImpl = installations;
  const { installationEntry, registrationPromise } = await getInstallationEntry(installationsImpl);
  if (registrationPromise) {
    registrationPromise.catch(console.error);
  } else {
    refreshAuthToken(installationsImpl).catch(console.error);
  }
  return installationEntry.fid;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function getToken(installations, forceRefresh = false) {
  const installationsImpl = installations;
  await completeInstallationRegistration(installationsImpl);
  const authToken = await refreshAuthToken(installationsImpl, forceRefresh);
  return authToken.token;
}
async function completeInstallationRegistration(installations) {
  const { registrationPromise } = await getInstallationEntry(installations);
  if (registrationPromise) {
    await registrationPromise;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function extractAppConfig(app) {
  if (!app || !app.options) {
    throw getMissingValueError("App Configuration");
  }
  if (!app.name) {
    throw getMissingValueError("App Name");
  }
  const configKeys = [
    "projectId",
    "apiKey",
    "appId"
  ];
  for (const keyName of configKeys) {
    if (!app.options[keyName]) {
      throw getMissingValueError(keyName);
    }
  }
  return {
    appName: app.name,
    projectId: app.options.projectId,
    apiKey: app.options.apiKey,
    appId: app.options.appId
  };
}
function getMissingValueError(valueName) {
  return ERROR_FACTORY$1.create("missing-app-config-values", {
    valueName
  });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const INSTALLATIONS_NAME = "installations";
const INSTALLATIONS_NAME_INTERNAL = "installations-internal";
const publicFactory = (container) => {
  const app = container.getProvider("app").getImmediate();
  const appConfig = extractAppConfig(app);
  const heartbeatServiceProvider = _getProvider(app, "heartbeat");
  const installationsImpl = {
    app,
    appConfig,
    heartbeatServiceProvider,
    _delete: () => Promise.resolve()
  };
  return installationsImpl;
};
const internalFactory = (container) => {
  const app = container.getProvider("app").getImmediate();
  const installations = _getProvider(app, INSTALLATIONS_NAME).getImmediate();
  const installationsInternal = {
    getId: () => getId(installations),
    getToken: (forceRefresh) => getToken(installations, forceRefresh)
  };
  return installationsInternal;
};
function registerInstallations() {
  _registerComponent(new Component(
    INSTALLATIONS_NAME,
    publicFactory,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
  _registerComponent(new Component(
    INSTALLATIONS_NAME_INTERNAL,
    internalFactory,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
}
registerInstallations();
registerVersion(name$1, version$1);
registerVersion(name$1, version$1, "esm2017");
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ANALYTICS_TYPE = "analytics";
const GA_FID_KEY = "firebase_id";
const ORIGIN_KEY = "origin";
const FETCH_TIMEOUT_MILLIS = 60 * 1e3;
const DYNAMIC_CONFIG_URL = "https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig";
const GTAG_URL = "https://www.googletagmanager.com/gtag/js";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const logger = new Logger("@firebase/analytics");
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ERRORS = {
  [
    "already-exists"
    /* AnalyticsError.ALREADY_EXISTS */
  ]: "A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.",
  [
    "already-initialized"
    /* AnalyticsError.ALREADY_INITIALIZED */
  ]: "initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-intialized instance.",
  [
    "already-initialized-settings"
    /* AnalyticsError.ALREADY_INITIALIZED_SETTINGS */
  ]: "Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.",
  [
    "interop-component-reg-failed"
    /* AnalyticsError.INTEROP_COMPONENT_REG_FAILED */
  ]: "Firebase Analytics Interop Component failed to instantiate: {$reason}",
  [
    "invalid-analytics-context"
    /* AnalyticsError.INVALID_ANALYTICS_CONTEXT */
  ]: "Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
  [
    "indexeddb-unavailable"
    /* AnalyticsError.INDEXEDDB_UNAVAILABLE */
  ]: "IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
  [
    "fetch-throttle"
    /* AnalyticsError.FETCH_THROTTLE */
  ]: "The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.",
  [
    "config-fetch-failed"
    /* AnalyticsError.CONFIG_FETCH_FAILED */
  ]: "Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}",
  [
    "no-api-key"
    /* AnalyticsError.NO_API_KEY */
  ]: 'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',
  [
    "no-app-id"
    /* AnalyticsError.NO_APP_ID */
  ]: 'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',
  [
    "no-client-id"
    /* AnalyticsError.NO_CLIENT_ID */
  ]: 'The "client_id" field is empty.',
  [
    "invalid-gtag-resource"
    /* AnalyticsError.INVALID_GTAG_RESOURCE */
  ]: "Trusted Types detected an invalid gtag resource: {$gtagURL}."
};
const ERROR_FACTORY = new ErrorFactory("analytics", "Analytics", ERRORS);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function createGtagTrustedTypesScriptURL(url) {
  if (!url.startsWith(GTAG_URL)) {
    const err = ERROR_FACTORY.create("invalid-gtag-resource", {
      gtagURL: url
    });
    logger.warn(err.message);
    return "";
  }
  return url;
}
function promiseAllSettled(promises) {
  return Promise.all(promises.map((promise) => promise.catch((e) => e)));
}
function createTrustedTypesPolicy(policyName, policyOptions) {
  let trustedTypesPolicy;
  if (window.trustedTypes) {
    trustedTypesPolicy = window.trustedTypes.createPolicy(policyName, policyOptions);
  }
  return trustedTypesPolicy;
}
function insertScriptTag(dataLayerName2, measurementId) {
  const trustedTypesPolicy = createTrustedTypesPolicy("firebase-js-sdk-policy", {
    createScriptURL: createGtagTrustedTypesScriptURL
  });
  const script = document.createElement("script");
  const gtagScriptURL = `${GTAG_URL}?l=${dataLayerName2}&id=${measurementId}`;
  script.src = trustedTypesPolicy ? trustedTypesPolicy === null || trustedTypesPolicy === void 0 ? void 0 : trustedTypesPolicy.createScriptURL(gtagScriptURL) : gtagScriptURL;
  script.async = true;
  document.head.appendChild(script);
}
function getOrCreateDataLayer(dataLayerName2) {
  let dataLayer = [];
  if (Array.isArray(window[dataLayerName2])) {
    dataLayer = window[dataLayerName2];
  } else {
    window[dataLayerName2] = dataLayer;
  }
  return dataLayer;
}
async function gtagOnConfig(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, measurementId, gtagParams) {
  const correspondingAppId = measurementIdToAppId2[measurementId];
  try {
    if (correspondingAppId) {
      await initializationPromisesMap2[correspondingAppId];
    } else {
      const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList2);
      const foundConfig = dynamicConfigResults.find((config) => config.measurementId === measurementId);
      if (foundConfig) {
        await initializationPromisesMap2[foundConfig.appId];
      }
    }
  } catch (e) {
    logger.error(e);
  }
  gtagCore("config", measurementId, gtagParams);
}
async function gtagOnEvent(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementId, gtagParams) {
  try {
    let initializationPromisesToWaitFor = [];
    if (gtagParams && gtagParams["send_to"]) {
      let gaSendToList = gtagParams["send_to"];
      if (!Array.isArray(gaSendToList)) {
        gaSendToList = [gaSendToList];
      }
      const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList2);
      for (const sendToId of gaSendToList) {
        const foundConfig = dynamicConfigResults.find((config) => config.measurementId === sendToId);
        const initializationPromise = foundConfig && initializationPromisesMap2[foundConfig.appId];
        if (initializationPromise) {
          initializationPromisesToWaitFor.push(initializationPromise);
        } else {
          initializationPromisesToWaitFor = [];
          break;
        }
      }
    }
    if (initializationPromisesToWaitFor.length === 0) {
      initializationPromisesToWaitFor = Object.values(initializationPromisesMap2);
    }
    await Promise.all(initializationPromisesToWaitFor);
    gtagCore("event", measurementId, gtagParams || {});
  } catch (e) {
    logger.error(e);
  }
}
function wrapGtag(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2) {
  async function gtagWrapper(command, ...args) {
    try {
      if (command === "event") {
        const [measurementId, gtagParams] = args;
        await gtagOnEvent(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementId, gtagParams);
      } else if (command === "config") {
        const [measurementId, gtagParams] = args;
        await gtagOnConfig(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, measurementId, gtagParams);
      } else if (command === "consent") {
        const [consentAction, gtagParams] = args;
        gtagCore("consent", consentAction, gtagParams);
      } else if (command === "get") {
        const [measurementId, fieldName, callback] = args;
        gtagCore("get", measurementId, fieldName, callback);
      } else if (command === "set") {
        const [customParams] = args;
        gtagCore("set", customParams);
      } else {
        gtagCore(command, ...args);
      }
    } catch (e) {
      logger.error(e);
    }
  }
  return gtagWrapper;
}
function wrapOrCreateGtag(initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, dataLayerName2, gtagFunctionName) {
  let gtagCore = function(..._args) {
    window[dataLayerName2].push(arguments);
  };
  if (window[gtagFunctionName] && typeof window[gtagFunctionName] === "function") {
    gtagCore = window[gtagFunctionName];
  }
  window[gtagFunctionName] = wrapGtag(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2);
  return {
    gtagCore,
    wrappedGtag: window[gtagFunctionName]
  };
}
function findGtagScriptOnPage(dataLayerName2) {
  const scriptTags = window.document.getElementsByTagName("script");
  for (const tag of Object.values(scriptTags)) {
    if (tag.src && tag.src.includes(GTAG_URL) && tag.src.includes(dataLayerName2)) {
      return tag;
    }
  }
  return null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const LONG_RETRY_FACTOR = 30;
const BASE_INTERVAL_MILLIS = 1e3;
class RetryData {
  constructor(throttleMetadata = {}, intervalMillis = BASE_INTERVAL_MILLIS) {
    this.throttleMetadata = throttleMetadata;
    this.intervalMillis = intervalMillis;
  }
  getThrottleMetadata(appId) {
    return this.throttleMetadata[appId];
  }
  setThrottleMetadata(appId, metadata) {
    this.throttleMetadata[appId] = metadata;
  }
  deleteThrottleMetadata(appId) {
    delete this.throttleMetadata[appId];
  }
}
const defaultRetryData = new RetryData();
function getHeaders(apiKey) {
  return new Headers({
    Accept: "application/json",
    "x-goog-api-key": apiKey
  });
}
async function fetchDynamicConfig(appFields) {
  var _a;
  const { appId, apiKey } = appFields;
  const request = {
    method: "GET",
    headers: getHeaders(apiKey)
  };
  const appUrl = DYNAMIC_CONFIG_URL.replace("{app-id}", appId);
  const response = await fetch(appUrl, request);
  if (response.status !== 200 && response.status !== 304) {
    let errorMessage = "";
    try {
      const jsonResponse = await response.json();
      if ((_a = jsonResponse.error) === null || _a === void 0 ? void 0 : _a.message) {
        errorMessage = jsonResponse.error.message;
      }
    } catch (_ignored) {
    }
    throw ERROR_FACTORY.create("config-fetch-failed", {
      httpStatus: response.status,
      responseMessage: errorMessage
    });
  }
  return response.json();
}
async function fetchDynamicConfigWithRetry(app, retryData = defaultRetryData, timeoutMillis) {
  const { appId, apiKey, measurementId } = app.options;
  if (!appId) {
    throw ERROR_FACTORY.create(
      "no-app-id"
      /* AnalyticsError.NO_APP_ID */
    );
  }
  if (!apiKey) {
    if (measurementId) {
      return {
        measurementId,
        appId
      };
    }
    throw ERROR_FACTORY.create(
      "no-api-key"
      /* AnalyticsError.NO_API_KEY */
    );
  }
  const throttleMetadata = retryData.getThrottleMetadata(appId) || {
    backoffCount: 0,
    throttleEndTimeMillis: Date.now()
  };
  const signal = new AnalyticsAbortSignal();
  setTimeout(async () => {
    signal.abort();
  }, FETCH_TIMEOUT_MILLIS);
  return attemptFetchDynamicConfigWithRetry({ appId, apiKey, measurementId }, throttleMetadata, signal, retryData);
}
async function attemptFetchDynamicConfigWithRetry(appFields, { throttleEndTimeMillis, backoffCount }, signal, retryData = defaultRetryData) {
  var _a;
  const { appId, measurementId } = appFields;
  try {
    await setAbortableTimeout(signal, throttleEndTimeMillis);
  } catch (e) {
    if (measurementId) {
      logger.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${e === null || e === void 0 ? void 0 : e.message}]`);
      return { appId, measurementId };
    }
    throw e;
  }
  try {
    const response = await fetchDynamicConfig(appFields);
    retryData.deleteThrottleMetadata(appId);
    return response;
  } catch (e) {
    const error = e;
    if (!isRetriableError(error)) {
      retryData.deleteThrottleMetadata(appId);
      if (measurementId) {
        logger.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${error === null || error === void 0 ? void 0 : error.message}]`);
        return { appId, measurementId };
      } else {
        throw e;
      }
    }
    const backoffMillis = Number((_a = error === null || error === void 0 ? void 0 : error.customData) === null || _a === void 0 ? void 0 : _a.httpStatus) === 503 ? calculateBackoffMillis(backoffCount, retryData.intervalMillis, LONG_RETRY_FACTOR) : calculateBackoffMillis(backoffCount, retryData.intervalMillis);
    const throttleMetadata = {
      throttleEndTimeMillis: Date.now() + backoffMillis,
      backoffCount: backoffCount + 1
    };
    retryData.setThrottleMetadata(appId, throttleMetadata);
    logger.debug(`Calling attemptFetch again in ${backoffMillis} millis`);
    return attemptFetchDynamicConfigWithRetry(appFields, throttleMetadata, signal, retryData);
  }
}
function setAbortableTimeout(signal, throttleEndTimeMillis) {
  return new Promise((resolve, reject) => {
    const backoffMillis = Math.max(throttleEndTimeMillis - Date.now(), 0);
    const timeout = setTimeout(resolve, backoffMillis);
    signal.addEventListener(() => {
      clearTimeout(timeout);
      reject(ERROR_FACTORY.create("fetch-throttle", {
        throttleEndTimeMillis
      }));
    });
  });
}
function isRetriableError(e) {
  if (!(e instanceof FirebaseError) || !e.customData) {
    return false;
  }
  const httpStatus = Number(e.customData["httpStatus"]);
  return httpStatus === 429 || httpStatus === 500 || httpStatus === 503 || httpStatus === 504;
}
class AnalyticsAbortSignal {
  constructor() {
    this.listeners = [];
  }
  addEventListener(listener) {
    this.listeners.push(listener);
  }
  abort() {
    this.listeners.forEach((listener) => listener());
  }
}
async function logEvent$1(gtagFunction, initializationPromise, eventName, eventParams, options) {
  if (options && options.global) {
    gtagFunction("event", eventName, eventParams);
    return;
  } else {
    const measurementId = await initializationPromise;
    const params = Object.assign(Object.assign({}, eventParams), { "send_to": measurementId });
    gtagFunction("event", eventName, params);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function validateIndexedDB() {
  if (!isIndexedDBAvailable()) {
    logger.warn(ERROR_FACTORY.create("indexeddb-unavailable", {
      errorInfo: "IndexedDB is not available in this environment."
    }).message);
    return false;
  } else {
    try {
      await validateIndexedDBOpenable();
    } catch (e) {
      logger.warn(ERROR_FACTORY.create("indexeddb-unavailable", {
        errorInfo: e === null || e === void 0 ? void 0 : e.toString()
      }).message);
      return false;
    }
  }
  return true;
}
async function _initializeAnalytics(app, dynamicConfigPromisesList2, measurementIdToAppId2, installations, gtagCore, dataLayerName2, options) {
  var _a;
  const dynamicConfigPromise = fetchDynamicConfigWithRetry(app);
  dynamicConfigPromise.then((config) => {
    measurementIdToAppId2[config.measurementId] = config.appId;
    if (app.options.measurementId && config.measurementId !== app.options.measurementId) {
      logger.warn(`The measurement ID in the local Firebase config (${app.options.measurementId}) does not match the measurement ID fetched from the server (${config.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`);
    }
  }).catch((e) => logger.error(e));
  dynamicConfigPromisesList2.push(dynamicConfigPromise);
  const fidPromise = validateIndexedDB().then((envIsValid) => {
    if (envIsValid) {
      return installations.getId();
    } else {
      return void 0;
    }
  });
  const [dynamicConfig, fid] = await Promise.all([
    dynamicConfigPromise,
    fidPromise
  ]);
  if (!findGtagScriptOnPage(dataLayerName2)) {
    insertScriptTag(dataLayerName2, dynamicConfig.measurementId);
  }
  gtagCore("js", /* @__PURE__ */ new Date());
  const configProperties = (_a = options === null || options === void 0 ? void 0 : options.config) !== null && _a !== void 0 ? _a : {};
  configProperties[ORIGIN_KEY] = "firebase";
  configProperties.update = true;
  if (fid != null) {
    configProperties[GA_FID_KEY] = fid;
  }
  gtagCore("config", dynamicConfig.measurementId, configProperties);
  return dynamicConfig.measurementId;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AnalyticsService {
  constructor(app) {
    this.app = app;
  }
  _delete() {
    delete initializationPromisesMap[this.app.options.appId];
    return Promise.resolve();
  }
}
let initializationPromisesMap = {};
let dynamicConfigPromisesList = [];
const measurementIdToAppId = {};
let dataLayerName = "dataLayer";
let gtagName = "gtag";
let gtagCoreFunction;
let wrappedGtagFunction;
let globalInitDone = false;
function warnOnBrowserContextMismatch() {
  const mismatchedEnvMessages = [];
  if (isBrowserExtension()) {
    mismatchedEnvMessages.push("This is a browser extension environment.");
  }
  if (!areCookiesEnabled()) {
    mismatchedEnvMessages.push("Cookies are not available.");
  }
  if (mismatchedEnvMessages.length > 0) {
    const details = mismatchedEnvMessages.map((message, index) => `(${index + 1}) ${message}`).join(" ");
    const err = ERROR_FACTORY.create("invalid-analytics-context", {
      errorInfo: details
    });
    logger.warn(err.message);
  }
}
function factory(app, installations, options) {
  warnOnBrowserContextMismatch();
  const appId = app.options.appId;
  if (!appId) {
    throw ERROR_FACTORY.create(
      "no-app-id"
      /* AnalyticsError.NO_APP_ID */
    );
  }
  if (!app.options.apiKey) {
    if (app.options.measurementId) {
      logger.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${app.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);
    } else {
      throw ERROR_FACTORY.create(
        "no-api-key"
        /* AnalyticsError.NO_API_KEY */
      );
    }
  }
  if (initializationPromisesMap[appId] != null) {
    throw ERROR_FACTORY.create("already-exists", {
      id: appId
    });
  }
  if (!globalInitDone) {
    getOrCreateDataLayer(dataLayerName);
    const { wrappedGtag, gtagCore } = wrapOrCreateGtag(initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, dataLayerName, gtagName);
    wrappedGtagFunction = wrappedGtag;
    gtagCoreFunction = gtagCore;
    globalInitDone = true;
  }
  initializationPromisesMap[appId] = _initializeAnalytics(app, dynamicConfigPromisesList, measurementIdToAppId, installations, gtagCoreFunction, dataLayerName, options);
  const analyticsInstance = new AnalyticsService(app);
  return analyticsInstance;
}
function getAnalytics(app = getApp()) {
  app = getModularInstance(app);
  const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
  if (analyticsProvider.isInitialized()) {
    return analyticsProvider.getImmediate();
  }
  return initializeAnalytics(app);
}
function initializeAnalytics(app, options = {}) {
  const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
  if (analyticsProvider.isInitialized()) {
    const existingInstance = analyticsProvider.getImmediate();
    if (deepEqual(options, analyticsProvider.getOptions())) {
      return existingInstance;
    } else {
      throw ERROR_FACTORY.create(
        "already-initialized"
        /* AnalyticsError.ALREADY_INITIALIZED */
      );
    }
  }
  const analyticsInstance = analyticsProvider.initialize({ options });
  return analyticsInstance;
}
async function isSupported() {
  if (isBrowserExtension()) {
    return false;
  }
  if (!areCookiesEnabled()) {
    return false;
  }
  if (!isIndexedDBAvailable()) {
    return false;
  }
  try {
    const isDBOpenable = await validateIndexedDBOpenable();
    return isDBOpenable;
  } catch (error) {
    return false;
  }
}
function logEvent(analyticsInstance, eventName, eventParams, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  logEvent$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], eventName, eventParams, options).catch((e) => logger.error(e));
}
const name = "@firebase/analytics";
const version = "0.10.4";
function registerAnalytics() {
  _registerComponent(new Component(
    ANALYTICS_TYPE,
    (container, { options: analyticsOptions }) => {
      const app = container.getProvider("app").getImmediate();
      const installations = container.getProvider("installations-internal").getImmediate();
      return factory(app, installations, analyticsOptions);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
  _registerComponent(new Component(
    "analytics-internal",
    internalFactory2,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name, version);
  registerVersion(name, version, "esm2017");
  function internalFactory2(container) {
    try {
      const analytics = container.getProvider(ANALYTICS_TYPE).getImmediate();
      return {
        logEvent: (eventName, eventParams, options) => logEvent(analytics, eventName, eventParams, options)
      };
    } catch (e) {
      throw ERROR_FACTORY.create("interop-component-reg-failed", {
        reason: e
      });
    }
  }
}
registerAnalytics();
export {
  getAnalytics,
  initializeAnalytics,
  isSupported,
  logEvent
};
