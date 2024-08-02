# Introduction to React

## JSX vs html

* JSX translates to `React.createElement` calls with babel.js
* JSX `className` instead class, because `class` is reserved in JS
* JSX {/* comment */} instead <!-- comment -->

````js
const Greeting = () => (
        <div>
          <Banner/>
          <h2 className="highlight"> Greetings!</h2>
        </div>
);
````

## Tooling

* NextJS or CreateReactApp as CLI
* For NextJS:
    * root component _app.js and index.js start page

## Styling in NextJS
* 4 global styling create a _document.js file, because NextJS has no index.html for style links
* Component styles, see components/banner.module.css
    * import {logo} from "./banner.module.css"
    * use className={logo} in JSX
* Inline
    * style={{color: red}} where inner braces are an object

## Props
* All input props given from parent component go into props object param
```jsx
<HouseRow house={h} />
```
```jsx
const HouseRow = ({ house }) => (
        <div> {house.address} <div>
          );
```

### Setting props with spread operator

```jsx
const houseResponse = {address: "1st Street", zip: "1234", town: "Garfield"};
<HouseRow {...houseResponse} />
```

Use destructoring, to only access properties, that are required:

```jsx
const HouseRow = ({ address, zip, town }) => (
        <div> {house.address} <div>
          );
```


### Props inside map function
Need to provide a key prop for tracking:
```jsx
  {houses.map((h) => (
        /* key property for tracking - needed for components in map fn */
        <HouseRow key={h.id} house={h} />
))}
```

## Hooks and State
* In general React lifecyle hooks or custom hooks

### useState Hook for change detection
```jsx
const houseArray = [
  {
    id: 1,
    address: "12 Valley of Kings, Geneva",
    country: "Switzerland",
    price: 900000,
  },
        ...
];

const HouseList = () => {
  const [houses, setHouses] = useState(houseArray);
  ...
```
* setHouses should always be used to change houses
* Always call useState hook at the start of the component function.
* Always provide _new_ array in `setHouses`
* Components can change their state, but not props they receive. (no double data binding)
    * Only 1 way data binding

```js
const addHouse = () => {
    setHouses([
      ...houses,
      {
        id: 3,
        address: "32 Valley Way, New York",
        country: "USA",
        price: 1000000,
      },
    ]);
  };
```

For state updates in child components pass `setSelectedHouse` function to a child using a wrapper function:

```jsx
const App = () => {
  const [selectedHouse, setSelectedHouse] = useState();

  const setSelectedHouseWrapper = (house) => {
    //do checks on
    setSelectedHouse(house);
  };

  return (
          <>
            <Banner>
              <div>Providing houses all over the world</div>
            </Banner>
            {selectedHouse ? (
                    <House house={selectedHouse} />
            ) : (
                    <HouseList selectHouse={setSelectedHouseWrapper} />
            )}
          </>
  );
};

```

### useEffect hook for fetching data initially and adding or removing event listeners

Provide empty deps array as 2nd parameter to only fetch initially and not on every change.
```js

// Component function and useEffect are run initially AND on every state change
useEffect(() => {
  const fetchHouses = async () => {
    const response = await api.getHouses();
    setHouses(response.json);
  };

  fetchHouses(); // Cannot make async calls directly in useEffect

  window.addEventListener('unhandledRejection', handler);

  return () => { // function returned is called on destruction
    window.removeEventListener('unhandledRejection', handler);
  };
}, []); // Only fetch initially, by providing empty deps []
```

### useRef hook as element reference

```js

const incBtnRef = useRef(null);

return (
        <> {/* empty container */}
         ...
          <button className="btn" ref={incBtnRef} onClick={increment}>
            Increment
          </button>
        </>
);
```

### Custom hook for api calls and loadingState

In general custom hooks start with `use` and are defined in their own file like here `useGetRequest.js`.

```jsx
import { useCallback, useState } from "react";

const loadingStatus = {
  loaded: "loaded",
  isLoading: "Loading...",
  hasErrored: "An error occured while loading",
};

const useGetRequest = (url) => {
  const [loadingState, setLoadingState] = useState(loadingStatus.isLoading);

  const get = useCallback(async () => { // useCallback to avoid an infinite loop
    setLoadingState(loadingStatus.isLoading);
    try {
      const rsp = await fetch(url);
      const result = await rsp.json();
      setLoadingState(loadingStatus.loaded);
      return result;
    } catch {
      setLoadingState(loadingStatus.hasErrored);
    }
  }, [url]);
  return { get, loadingState };
};

export default useGetRequest;
```

Every usage of a custom hook creates an isolated instance. When using `useGetRequest` the `get` method must be put into the deps array.
Therefore `useGetRequest` has the useCallback hook in it, to avoid an endless fetching loop.

```jsx
const [houses, setHouses] = useState([]);
const { get, loadingState } = useGetRequest("/api/houses");

useEffect(() => {
  const fetchHouses = async () => {
    const houses = await get();
    setHouses(houses);
  };
  fetchHouses();
}, [get]); // dependent on get
```

## Conditional rendering

JS logic evaluated for className:

```jsx
<div className={`${house.price >= 500000 ? "text-primary" : ""}`}>
```

Only render an element if house.price is truthy:

```jsx
return (
        <tr onClick={() => selectHouse(house)}>
          <td>{house.address}</td>
          
          {house.price && (
                  <td >
                    {currencyFormatter.format(house.price)}
                  </td>
          )}
          
        </tr>
);
```

## React.Context

Avoid having to pass state down to children. Also could use context to build your own router.

````jsx
const navValues = {
  home: "Home",
  house: "House",
};

const navigationContext = React.createContext(navValues.home);

const App = () => {
    
    // setNav wrapper with useCallback
  const navigate = useCallback(
    (navTo, param) => setNav({ current: navTo, param, navigate }),
    []
  );
  
  // nav state of application
  const [nav, setNav] = useState({ current: navValues.home, navigate });
  
  return (
    <navigationContext.Provider value={nav}>
    <Banner>
    <div>Providing houses all over the world</div>
    </Banner>
      
      {/* see implementation below */}
    <ComponentPicker currentNavLocation={nav.current} />
      
    </navigationContext.Provider>
  );
};

export { navigationContext, navValues };
export default App;
````

The logic to switch the component based on nav state:

````jsx
const ComponentPicker = ({ currentNavLocation }) => {
  switch (currentNavLocation) {
    case navValues.home:
      return <HouseList />;
    case navValues.house:
      return <House />;
    default:
      return (
              <h3>
                No component for navigation value
                {currentNavLocation} found
              </h3>
      );
  }
};

export default ComponentPicker;
````

How context is consumed:

````jsx
const HouseRow = ({ house }) => {
    
  const { navigate } = useContext(navigationContext); // useContext hook to get navigate function
  
  return (
          <tr onClick={() => navigate(navValues.house, house)}> {/* call navigate function */}
            <td>{house.address}</td>
            <td>{house.country}</td>
            {house.price && (
                    <td className={`${house.price >= 500000 ? "text-primary" : ""}`}>
                      {currencyFormatter.format(house.price)}
                    </td>
            )}
          </tr>
  );
};
````

But in reality better use a real router (either React router or next.js router depending on framework).

## Forms

`useState` hook and `onChange` handler on an input element.

````jsx
const Bids = ({ house }) => {
    const { bids, loadingState, addBid } = useBids(house.id);

    const emptyBid = {
        houseId: house.id,
        bidder: "",
        amount: 0,
    };

    const [newBid, setNewBid] = useState(emptyBid); // initial state

    if (loadingState !== loadingStatus.loaded)
        return <LoadingIndicator loadingState={loadingState} />;

    const onBidSubmitClick = () => {
        addBid(newBid);
        setNewBid(emptyBid);
    };

    return (
        <>
            <div className="row">
                <div className="col-5">
                    <input
                        id="bidder"
                        className="h-100"
                        type="text"
                        value={newBid.bidder}
                        onChange={(e) => setNewBid({ ...newBid, bidder: e.target.value })} {/* provide new object to set state */}
                        placeholder="Bidder"
                    ></input>
                </div>
                <div className="col-2">
                    <button className="btn btn-primary" onClick={onBidSubmitClick}>
                        Add
                    </button>
                </div>
            </div>
        </>
    );
};
````

# Working with Components React 18

## Next.js Toolchain

`npx create-next-app@latest` without `App Router`. `next` dependency.
To run just exec `npm ci` and `npm run dev`.
`next.config.js` has config settings. `index.js` is root file and App.js root component.

## Higher Order Components (HOCs)

Pattern that uses a function that enhances a component:

```jsx
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

export const withTheme = (Component) => {
  function Func(props) {
    const { darkTheme, toggleTheme } = useContext(ThemeContext);
    return (
      <Component {...props} darkTheme={darkTheme} toggleTheme={toggleTheme} />
    );
  }
  return Func;
};
```

The enhanced component can use the props `darkTheme` and `toggleTheme`:

```jsx
import { withTheme } from "../hocs/withTheme";

const Header = ({ layoutVersion, darkTheme, toggleTheme }) => {
  return (
    <header>
      <h2>To-do List</h2>
      <span className="nav-item">
        <input
          type="checkbox"
          checked={darkTheme === true}
          className="theme-toggle-checkbox"
          autoComplete="off"
          id="toggleThemeId"
          onChange={() => {
            toggleTheme();
          }}
        />
        <label htmlFor="toggleThemeId" className="theme-toggle-checkbox-label">
          <i className="fas fa-moon"></i>
          <i className="fas fa-sun"></i>
          <span className="ball"></span>
        </label>
        <span>{layoutVersion}</span>
      </span>
    </header>
  );
};

export default withTheme(Header);
```

## React Developer Tools

2 new inspector tabs: components and profile.

### Components tab

Expand component by double-click.

Hitting the `<>` icon on the right will open the .js source map.

Because `useState` values are listed without the name, one can use:

```jsx
useDebugValue(`count1:${count1}`);
```

In some case custom React hooks could provide additional debugger output.


### Profiler tab

#### Profile page load

Select `Flamegraph` tab, hit reload button on the left side and then the stop recording button.

The graph shows rendering times for each rendered component.

#### Profile a single action

Hit record button. Change a TodoItem. Hit record button again to stop recording.

Now inspect which elements have been rerendered.

Hit settings button in the middle. For `Profiler` activate `Record why each component rendered while profiling`.

### Error boundaries

Run a prod build with `npm run build` and run `npm start`. See that runtime errors will not have useful messages.

Therefore error boundaries can provide help:

````jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
````

Now could wrap any component (in an Inner component) with ErrorBoundary.

````jsx
const ToDo = (props) => {
return (
  <ErrorBoundary>
    <Inner {...props} />
  </ErrorBoundary>
  );
};
````

## Rendering performance optimization

### React.memo

For rendering pure components, where the appearance only depends on their props values.

Simply wrap exported component in memo() function like this:

```jsx
import { memo } from "react";

function ToDoItemText({ important, todoText }) {
  return (
    <>
      {important ? (
        <span className="badge warning-bg">
          <i className="fa fa-exclamation-circle"></i>
        </span>
      ) : null}
      {todoText.slice(0, 60)}
    </>
  );
}

export default memo(ToDoItemText); // memo will only rerender if props values change
```

Also possible to provide a requiresRerender function as second parameter:

````jsx

export default memo(ToDo, (prevProps, nextProps) => {
  return !(
          prevProps.todoItem.completed != nextProps.todoItem.completed ||
          prevProps.todoItem.important != nextProps.todoItem.important ||
          prevProps.idUpdating === prevProps.todoItem.id ||
          nextProps.idUpdating === nextProps.todoItem.id
  );
});
````

### Debouncing / useDeferredValue

If lots of search terms slow down the typing in search input, then can `useDeferredValue` for search term state to keep the input responsive.
Only needed for hundreds or thousands of list items.

```jsx
const App = () => {
  const [searchText, setSearchText] = useState("");
  const searchTextDeferred = useDeferredValue(searchText);

  return (
          <TodosDataProvider>
            <Layout>
                <ToDoManager
                        displayStatus={displayStatus} important={important}
                        searchText={searchTextDeferred}
                />
            </Layout>
          </TodosDataProvider>
  );
};
export default App;
```

### Prioritizing updates / useTransition

Can use `startTransition` to mark low priority updates for long-running tasks such as search.

```jsx
function App() {
  const [search, setSearch] = useState(""); // state used for search process
  const [searchHighPriority, setSearchHighPriority] = useState(""); // hi prio state for search text
  const [isPending, startTransition] = useTransition(); // call startTransition to mark low prio task, isPending can be used for spinner
  const [todoList, setTodoList] = useState([
    "clean dog", "eat lunch", "wash clothes", "...",
  ]);

  return (
          <div>
            <input
                    value={searchHighPriority}
                    onChange={(e) => {
                      setSearchHighPriority(e.target.value); // search text value is responsive
                      startTransition(() => setSearch(e.target.value)); // search results will be delayed
                    }}
            />
            <ShowTodoList todoList={todoList} deferredSearch={search} />
          </div>
  );
}
```

## Server components / SSR

Instead of Todos REST call can get prerendered TodoListComponent from server for faster loading.
Downside is there cannot be browser events or local state in SSR components.
But ProviderContext exists.
Using NextJs App Router with /app/page.js root component:

```jsx
import 'server-only';
import React, { Suspense } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout//Footer';
import ImportantContextProvider from './contexts/ImportantContext';
import ToDoFilterToolbar from './components/todo/ToDoFilterToolbar';
import ToDoList from './components/todo/ToDoList';

export default function Page() {
  return (
    <>
      <Header />
      <ImportantContextProvider>
        <ToDoFilterToolbar />
        <Suspense fallback={<div>Loading... </div>}> {/* suspense wrapper for loading ToDoList */}
          <ToDoList />
        </Suspense>
      </ImportantContextProvider>
      <Footer />
    </>
  );
}
```

The context is a client side hook with `'use client';` at the top:

````jsx
'use client';
import { createContext, useContext, useState } from 'react';

export const ImportantContext = createContext();

export default function ImportantContextProvider({
  children,
}) {
  const [important, setImportant] = useState(false);
  return (
    <ImportantContext.Provider
      value={{ important, setImportant }}
    >
      {children}
    </ImportantContext.Provider>
  );
}

export const useImportantContext = () => {
  const value = useContext(ImportantContext);
  if (!value) {
    throw new Error(
      'useImportantContext must be used within an ' +
        'ImportantContextProvider',
    );
  }
  return value;
};
````

The ToDoList component is a server component using the `server-only` package:

````jsx
import "server-only";
import ToDoItem from "../../components/todo/ToDoItem";
import ToDoItemClient from
          "../../components/todo/ToDoItemClient";
const sleep = (ms) => new Promise((resolve) =>
        setTimeout(resolve, ms));

export default async function ToDoList() {
  const url = "http://localhost:3000/api/todos";
  const res = await fetch(url, {
    next: {
      revalidate: 0,
    },
  });
  const results = await res.json();
  const todoList = results;
  await sleep(2000);
  return (
          <div className="tasks">
            {todoList.map((toDo) => {
              return (
                      <ToDoItemClient toDo={toDo} key={toDo.id}>
                        <ToDoItem toDo={toDo} />
                      </ToDoItemClient>
              );
            })}
          </div>
  );
}
````

Since the child component ToDoItem is a client side component it is wrapped in a function called ToDoItemClient:

````jsx
'use client';

import { useImportantContext } from '../../contexts/ImportantContext';

export default function ToDoItemClient({ toDo, children }) {
  const { important } = useImportantContext();

  return important === false ? (
    <>{children}</>
  ) : toDo.important === true ? (
    <>{children}</>
  ) : null;
}
````

The function can access the client context state as well as the children passed in from the ToDoList server component. 

