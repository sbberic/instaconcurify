import { useState } from 'react';
import { Menu, Input, Card, List, NonIdealState } from '@instabase.com/pollen';
import { AppChrome, AppMenu } from '@instabase.com/app-os-kit';
import { InstabaseAPI } from '@instabase.com/api';

import { SAppContainer, SSearchContainer } from './styles';

const api = new InstabaseAPI({
  base: process.env.REACT_APP_IB_ROOT,
  accessToken: process.env.REACT_APP_IB_ACCESS_TOKEN,
});

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [accountList, setAccountList] = useState([]);

  const onSearchChange = e => setSearchValue(e.target.value);
  const onSearchEnter = async e => {
    if (e.key === 'Enter') {
      try {
        const data = await api.account.listUsers({
          search_string: searchValue,
        });
        setAccountList(data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <AppChrome appName="Demo App" appIcon="./icon.png">
      <AppMenu>
        <Menu.Item key="Example Menu" label="Example Menu">
          <Menu.Item.Option
            id="Menu item"
            key="Menu item"
            label="Menu item"
            onClick={() => console.log('Menu item!')}
          />
        </Menu.Item>
      </AppMenu>
      <SAppContainer>
        <SSearchContainer>
          <Input
            rightIcon="search"
            label="Account search"
            placeholder="admin..."
            onChange={onSearchChange}
            onKeyDown={onSearchEnter}
            value={searchValue}
          />
        </SSearchContainer>
        <Card>
          <Card.Title title="Search results" />
          <Card.Section>
            {accountList.length > 0 ? (
              <List
                items={accountList}
                itemRenderer={item => (
                  <List.Item key={item.email}>{item.email}</List.Item>
                )}
              />
            ) : (
              <NonIdealState
                icon="search"
                title="No results"
                description="Search for a user, try 'admin'"
              />
            )}
          </Card.Section>
        </Card>
      </SAppContainer>
    </AppChrome>
  );
}

export default App;
