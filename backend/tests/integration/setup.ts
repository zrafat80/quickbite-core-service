import 'reflect-metadata';
import { loadTestEnvironment } from './helpers/test-database';

loadTestEnvironment();
jest.setTimeout(30_000);
