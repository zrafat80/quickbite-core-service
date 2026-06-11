type ZoneTest = () => Promise<void>;

interface EndpointMatrix {
  goldenPath: ZoneTest;
  validation: ZoneTest;
  security: ZoneTest;
  businessLogic: ZoneTest;
}

export function describeEndpoint(
  endpoint: string,
  matrix: EndpointMatrix,
): void {
  describe(endpoint, () => {
    it('ZONE 1: completes the golden path and persists the expected state', async () =>
      matrix.goldenPath());
    it('ZONE 2: rejects malformed input through HTTP validation', async () =>
      matrix.validation());
    it('ZONE 3: enforces the endpoint security contract', async () =>
      matrix.security());
    it('ZONE 4: enforces domain business rules', async () =>
      matrix.businessLogic());
  });
}
