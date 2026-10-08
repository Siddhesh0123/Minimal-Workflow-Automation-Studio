import * as vm from 'vm';

export async function executeCondition(config: any, input: any) {
  const expression = config.expression || 'return true;';
  
  try {
    const sandbox = {
      data: input,
    };
    
    vm.createContext(sandbox);
    
    const script = new vm.Script(`
      (function() {
        // If they just wrote "data.value > 0", implicitly return it
        const exp = \`${expression}\`;
        if (!exp.includes('return ')) {
           return eval(exp);
        }
        ${expression}
      })();
    `);
    
    const result = script.runInContext(sandbox, { timeout: 1000 });
    return !!result;
  } catch (error: any) {
    throw new Error(`Condition evaluation failed: ${error.message}`);
  }
}
