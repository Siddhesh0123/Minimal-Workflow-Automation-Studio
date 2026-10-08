import * as vm from 'vm';

export async function executeTransform(config: any, input: any) {
  const expression = config.expression || 'return data;';
  
  try {
    // Create a new sandbox to safely evaluate the JS
    const sandbox = {
      data: input,
      console: {
        log: (...args: any[]) => console.log('Transform Log:', ...args),
      }
    };
    
    vm.createContext(sandbox);
    
    // Wrap in an IIFE to allow return statements at the top level
    const script = new vm.Script(`
      (function() {
        ${expression}
      })();
    `);
    
    const result = script.runInContext(sandbox, { timeout: 1000 });
    return result;
  } catch (error: any) {
    throw new Error(`Transform failed: ${error.message}`);
  }
}
