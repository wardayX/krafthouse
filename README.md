



# KraftHouse

 

A React + Firebase social platform for artisans and craft creators. KraftHouse provides authentication, artisan profiles, social posting, user discovery, following, post interactions, analytics, image uploads, and an AI assistant.

 

## Demo

 

**Live Application:** https://bloom-final-471317.web.app/

 

## Overview

 

KraftHouse is a web application designed around a social experience for artisans. Authenticated users can create and manage artisan profiles, publish posts, interact with other users, discover artisans, and view engagement information through a dashboard.

 

The frontend is implemented with React and Vite. Firebase provides authentication, Cloud Firestore for application data, and Cloud Storage for uploaded images. The application also contains an AI assistant integration using the Gemini API.

 

## Key Features

 

### Authentication

 

- Email/password sign-up and login using Firebase Authentication.

- Google sign-in using Firebase Authentication and Google OAuth.

- Persistent authentication state using Firebase's `onAuthStateChanged`.

- Protected application routes through a reusable `ProtectedRoute` component.

- Logout functionality.

 

### Artisan Profiles

 

- Create an artisan profile during registration.

- Store profile information such as display name, username, craft type, experience, location, biography, skills, and visibility.

- Edit profile information after registration.

- Upload profile and cover images.

- Store image URLs in Firestore after uploading files to Firebase Cloud Storage.

 

### Social Feed and Posts

 

- Create posts with author and artisan information.

- Display posts in the social feed.

- Like posts.

- Comment on posts.

- Share posts.

- Track post-level counters such as likes, comments, shares, and views.

- Retrieve user posts and display them in the dashboard.

 

### User Discovery

 

- Search for artisans/users.

- Filter public users by craft type.

- Search across fields such as name, username, craft type, location, and skills.

- Follow and unfollow users.

- Check whether one user follows another.

 

### Real-Time Data

 

- Firestore `onSnapshot` listeners are used in the application for real-time updates in relevant parts of the social experience.

- Firestore offline persistence is enabled through IndexedDB when supported by the browser.

 

### Dashboard and Analytics

 

The authenticated dashboard provides sections for:

 

- Profile

- Posts

- Content creation

- User search

- Analytics

- Settings

- AI Assistant

 

The analytics service calculates metrics including:

 

- Total views

- Total posts

- Total likes

- Total comments

- Average engagement

 

The current analytics implementation also contains a placeholder/mock value for inquiries.

 

**Frontend:**  

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Backend & Cloud:**  

![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Cloud%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firebase Storage](https://img.shields.io/badge/Firebase%20Storage-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

**Development Tools:**  

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

## Tech Stack

## Architecture

 

At a high level, the application follows this structure:

 

```text

                         KraftHouse

                             |

                       React + Vite

                             |

             +---------------+---------------+

             |               |               |

        React Router     AuthContext      Components

             |               |               |

       Protected Routes      |       +-------+--------+

                             |       |       |        |

                             |    Profile  Feed    Dashboard

                             |       |       |        |

                             +-------+-------+--------+

                                     |

                                  Firebase

                         +-----------+-----------+

                         |           |           |

                  Authentication Firestore   Storage

                         |           |           |

                      Identity     App data     Images

                                     |

                           +---------+---------+

                           |                   |

                         Users                Posts

                           |                   |

                    Follows / Profiles    Likes / Comments

                                                |

                                           Real-time feed

 

                                     |

                               AI Assistant

                                     |

                                Gemini API

```

 

## Application Flow

 

### Authentication Flow

 

```text

User

  |

  +--> Email/Password Sign Up

  |          |

  |          +--> Firebase Authentication

  |          |

  |          +--> Create users/{uid} in Firestore

  |

  +--> Email/Password Login

  |          |

  |          +--> Firebase Authentication

  |

  +--> Google Sign-In

             |

             +--> Firebase Authentication

             |

             +--> Create Firestore profile if required

```

 

### Image Upload Flow

 

```text

User selects image

        |

        v

uploadImage()

        |

        v

Firebase Cloud Storage

        |

        v

getDownloadURL()

        |

        v

Image URL

        |

        v

Firestore profile/post document

```

 

Uploaded files are organized under user-specific paths such as:

 

```text

{uid}/profiles/

{uid}/covers/

{uid}/posts/

```

 

### Post Creation Flow

 

```text

ContentCreator

      |

      v

createPost()

      |

      +--> Build post document

      |

      +--> Add document to Firestore "posts"

      |

      +--> Increment user's postsCount

```

 

### Real-Time Feed Flow

 

```text

Firestore

    |

    | onSnapshot()

    v

React state

    |

    v

Social Feed UI

```

 

## Firebase Data Model

 

The application primarily uses Firestore collections such as:

 

### `users`

 

User documents are stored using the Firebase Authentication UID as the document ID.

 

Typical profile fields include:

 

```text

uid

email

displayName

username

craftType

experience

location

bio

skills

isPublic

followers

following

postsCount

profileImage

coverImage

createdAt

updatedAt

```

 

### `posts`

 

Post documents contain information such as:

 

```text

authorId

authorName

authorAvatar

authorUsername

craftType

likes

likedBy

comments

shares

views

createdAt

updatedAt

```

 

The application also uses Firestore data for social interactions such as follows, comments, and likes.

 

## Project Structure

 

```text

krafthouse-main/

|

+-- public/

|

+-- src/

|   |

|   +-- App.jsx

|   +-- main.jsx

|   +-- index.css

|   |

|   +-- config/

|   |   +-- api.jsx

|   |   +-- firebase.jsx

|   |

|   +-- contexts/

|   |   +-- AuthContext.jsx

|   |

|   +-- services/

|   |   +-- apiService.jsx

|   |

|   +-- components/

|       |

|       +-- Home.jsx

|       |

|       +-- auth/

|       |   +-- Login.jsx

|       |   +-- SignUp.jsx

|       |   +-- ProtectedRoute.jsx

|       |

|       +-- artisan/

|       |   +-- ArtisanDashboard.jsx

|       |

|       +-- chatbot/

|       |   +-- AIAssistant.jsx

|       |

|       +-- common/

|       |   +-- Navigation.jsx

|       |   +-- InitialsAvatar.jsx

|       |

|       +-- dashboard/

|           +-- Dashboard.jsx

|           +-- ProfileSection.jsx

|           +-- ProfileManager.jsx

|           +-- UserProfile.jsx

|           +-- UserSearch.jsx

|           +-- ContentCreator.jsx

|           +-- SocialFeed.jsx

|           +-- AnalyticsSection.jsx

|           +-- AnalyticsDashboard.jsx

|           +-- SettingsSection.jsx

|

+-- firebase.json

+-- netlify.toml

+-- vite.config.js

+-- package.json

```

 

## Important Application Modules

 

### `AuthContext.jsx`

 

This is the central application context for authentication and many user-facing data operations.

 

It contains functionality for:

 

- Sign up

- Login

- Logout

- Google login

- User profile updates

- Image uploads

- Post creation

- Post retrieval

- Likes

- Comments

- Shares

- User search

- Follow/unfollow

- Follow-status checks

 

The context exposes these operations through the custom `useAuth()` hook.

 

### `ProtectedRoute.jsx`

 

Controls access to protected routes.

 

The application checks authentication state before rendering protected content such as the home page and dashboard.

 

### `Dashboard.jsx`

 

Acts as the main authenticated workspace and coordinates:

 

- Profile

- Posts

- Content creation

- Search

- Analytics

- Settings

- AI Assistant

 

### `SocialFeed.jsx`

 

Handles the social-feed experience and real-time Firestore data where applicable.

 

### `ContentCreator.jsx`

 

Provides the interface for creating content/posts.

 

### `UserSearch.jsx`

 

Provides user/artisan discovery and filtering.

 

### `AIAssistant.jsx`

 

Provides the chat interface and Gemini API integration.

 

### `apiService.jsx`

 

Contains reusable data-access methods for artisan profiles, posts, analytics, search, likes, and follow operations using Firebase services.

 

## API Configuration

 

The project contains a configurable backend API base URL:

 

```text

https://artisan-backend-577359325267.us-central1.run.app

```

 

Configured endpoint groups include:

 

```text

/health

/api/auth

/api/artisan

/api/ai

```

 

The source also contains Firebase-based service methods for many of the application's core operations.

 

## Installation

 

### Prerequisites

 

- Node.js 18 or compatible version

- npm

- Firebase project with the required services enabled

 

### Clone the repository

 

```bash

git clone https://github.com/wardayX/krafthouse

cd krafthouse-main

```

 

### Install dependencies

 

```bash

npm install

```

 

### Configure environment variables

 

Create a `.env` file in the project root and provide the Firebase configuration values required by `src/config/firebase.jsx`.

 

### Start the development server

 

```bash

npm run dev

```

 

Vite will start the local development server.

 

## Available Scripts

 

```bash

npm run dev

```

 

Starts the Vite development server.

 

```bash

npm run build

```

 

Creates the production build in `dist/`.

 

```bash

npm run preview

```

 

Serves the production build locally for preview.

 

```bash

npm run lint

```

 

Runs ESLint over the project.

 

## Deployment

 

### Firebase Hosting

 

The repository contains a `firebase.json` configuration that uses:

 

```text

dist/

```

 

as the Firebase Hosting public directory and rewrites application routes to `index.html`.

 

A typical deployment flow is:

 

```bash

npm run build

firebase deploy

```

 

### Netlify

 

The repository also contains `netlify.toml` configured to:

 

- Build using `npm run build`

- Publish the `dist` directory

- Redirect application routes to `index.html`

- Use Node.js 18

 

## Security Notes

 

- Do not commit `.env` files containing secrets.

- Firebase security rules should be configured according to the application's authentication and authorization requirements.

- Authentication and authorization should be enforced by backend/security rules rather than relying only on frontend route protection.

- The Gemini API key should not be exposed in production browser code. Use a server-side API or Cloud Function for protected AI requests.

- Validate uploaded files and enforce appropriate size/type restrictions.

- Validate and sanitize user-generated content where appropriate.

 

## Known Implementation Notes

 

The repository contains both Firebase service functions and a configurable Cloud Run API service. The current frontend uses Firebase extensively for authentication, Firestore, and storage operations.

 

The analytics implementation calculates several metrics from post data and currently uses a mock/random value for inquiries.

 

The source imports some Material UI modules, while the provided `package.json` does not currently list the corresponding Material UI dependencies. If a clean installation reports missing `@mui/*` modules, those dependencies will need to be added to `package.json`.

 

## Future Improvements

 

Potential improvements include:

 

- Move Gemini API calls behind a secure backend endpoint.

- Strengthen Firestore security rules and authorization.

- Use Firestore transactions/batched writes where multiple related updates must remain consistent.

- Improve search using a dedicated search/indexing service for large datasets.

- Add pagination/infinite scrolling for posts and users.

- Replace mock analytics data with persisted analytics events.

- Add automated testing for authentication, posts, social interactions, and profile management.

- Add stronger form validation and upload validation.

- Improve error handling and user-facing feedback.

- Add monitoring and logging for production deployments.

- Add CI/CD checks for linting, tests, and builds.

 

## License

 

No explicit license file is included in the current repository. Add a license before distributing the project publicly if required.

 

## Demo

 

**Live:** https://bloom-final-471317.web.app/
