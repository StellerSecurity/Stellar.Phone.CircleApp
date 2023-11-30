import { Circle } from "src/app/models/circle.model";

const pureCircles = [
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
  {
    wipe_status: 5,
    name: 'Food Eating Routine',
    wipe_auth_token: 'On Saturday, I went to the park with On Saturday, I went to the park with',
    // last_modified: '2022-05-06',
  },
];

const generateCircle = (circle: any) => {
  const _circle = new Circle();
  _circle.name = circle.name;
  _circle.wipe_auth_token = circle.wipe_auth_token;
  _circle.wipe_status = circle.wipe_status;

  return _circle;
}

export const circles: Circle[] = pureCircles.map(generateCircle);