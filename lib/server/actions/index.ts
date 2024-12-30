import * as users from "./users";

/**
 * Om het aantal import statements te beperken en de code overzichtelijk te houden, groeperen we alle acties in dit
 * bestand.
 * We exporteren alle named exports opnieuw zodat we iets als `import {signInOrRegister} from '@actions'`
 * kunnen gebruiken.
 * Let op, hiervoor moet de '@actions' alias wel correct geconfigureerd zijn in tsconfig.json.
 */
export * from "./users";

/**
 * We voorzien hier een default export met alle actions in de volledige applicatie.
 * Aangezien we op verschillende plaatsen in de applicatie gebruik maken van functies met dezelfde naam, is het handig
 * als we die functies niet altijd moeten importen met naam, maar wel als een object dat alle functies in één laag
 * groepeert.
 */
export default {
  ...users,
};
