const makeRandom = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const lowerCaseCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const numberCharacters = '0123456789';

  const random = (characters: string, length: number) => {
    let result = '';

    const charactersLength = characters.length;

    let counter = 0;

    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }

    return result;
  };

  const itemFromArray = <T>(arr: T[] = []) => arr[Math.floor(Math.random() * arr.length)];

  return {
    string: (length: number) => random(characters, length),
    stringLowerCase: (length: number) => random(lowerCaseCharacters, length),
    stringNumber: (length: number) => random(numberCharacters, length),
    itemFromArray,
  };
};

export const random = makeRandom();
