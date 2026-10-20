import { jest } from "@jest/globals";
import { prepareOAuthLogin } from "../../src/oauth/login-setup.mjs";

test("prepares picker authorization and browser launch", () => {
  const print = jest.fn();
  const createAuthorization = jest.fn(() => ({
    verifier: "verify",
    state: "state",
    makeAuthorization: jest.fn(),
  }));
  const callbackPromise = Promise.resolve();
  const getSelectedScopes = () => ["zone.read"];
  const callback = { callback: callbackPromise, getSelectedScopes };
  const createCallback = jest.fn(() => callback);
  const launchBrowser = jest.fn();
  const result = prepareOAuthLogin(
    {
      clientId: "client",
      redirectHost: "127.0.0.1",
      port: 8000,
      scopePicker: true,
      scopes: ["zone.read"],
      server: {},
      open: jest.fn(),
      print,
    },
    { createAuthorization, createCallback, launchBrowser },
  );
  expect(result).toEqual({
    redirectUri: "http://127.0.0.1:8000/oauth/callback",
    verifier: "verify",
    callback: callbackPromise,
    getSelectedScopes,
  });
  expect(print).toHaveBeenCalledWith("Open this URL to set up cfhub: http://127.0.0.1:8000/");
  expect(createCallback).toHaveBeenCalledWith(
    expect.objectContaining({ state: "state", server: {} }),
  );
  expect(launchBrowser).toHaveBeenCalledWith(
    expect.objectContaining({ browserUrl: "http://127.0.0.1:8000/" }),
  );
});

test("prepares direct authorization and browser launch", () => {
  const makeAuthorization = jest.fn(() => new URL("https://auth.test/"));
  const launchBrowser = jest.fn();
  const callback = { callback: Promise.resolve(), getSelectedScopes: () => ["zone.read"] };
  prepareOAuthLogin(
    {
      clientId: "client",
      redirectHost: "localhost",
      port: 9000,
      scopePicker: false,
      scopes: ["dns.read"],
      server: {},
      open: jest.fn(),
      print: jest.fn(),
    },
    {
      createAuthorization: () => ({ verifier: "verify", state: "state", makeAuthorization }),
      createCallback: () => callback,
      launchBrowser,
    },
  );
  expect(makeAuthorization).toHaveBeenCalledTimes(2);
  expect(launchBrowser).toHaveBeenCalledWith(
    expect.objectContaining({ browserUrl: "https://auth.test/" }),
  );
});

test("uses default authorization, callback, and browser helpers", () => {
  let requestHandler;
  const server = {
    setOAuthRequestHandler: jest.fn((handler) => {
      requestHandler = handler;
    }),
  };
  const open = jest.fn();
  const print = jest.fn();

  const result = prepareOAuthLogin({
    clientId: "client",
    redirectHost: "127.0.0.1",
    port: 8080,
    scopePicker: false,
    scopes: ["zone.read"],
    server,
    open,
    print,
  });

  expect(result.redirectUri).toBe("http://127.0.0.1:8080/oauth/callback");
  expect(result.verifier).toEqual(expect.any(String));
  expect(result.getSelectedScopes()).toEqual(expect.arrayContaining(["zone.read"]));
  expect(server.setOAuthRequestHandler).toHaveBeenCalledTimes(1);
  expect(requestHandler).toEqual(expect.any(Function));
  expect(open).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\//));
  expect(print).toHaveBeenCalledWith(expect.stringContaining("authorize cfhub"));
});
