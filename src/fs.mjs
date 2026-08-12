import * as nativeFs from 'node:fs';

// A mutable facade keeps filesystem operations injectable and straightforward to mock.
export const fs = { ...nativeFs };
