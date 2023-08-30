const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants')

module.exports = (phase) => {

  // npm run dev or next dev
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  // npm run build or next build
  const isProd = phase === PHASE_PRODUCTION_BUILD && process.env.STAGING !== '1';

  // npm run build or next build
  const isStaging = phase === PHASE_PRODUCTION_BUILD && process.env.STAGING === '1';

  

  const env = {
      TITLE: (() => {
          if(isDev) return 'Title Dev'
          if(isProd) return 'Title Prod'
          if(isStaging) return 'Title Stg'
      })()
  }


  const rewrites = () => {
      return [
        {
            source: '/configJsonRewrite',
            destination: '/about'
        },
        {
            source: '/confictRW',
            destination: '/about'
        }
      ]
  }

  const redirects = () => {
      return [
        {
            source: '/confictRD',
            destination: '/',
            permanent: true
        },
        {
            source: '/nextConfigRedirect',
            destination: '/',
            permanent: true
        }
      ]
  }

  const headers = () => {
      return [
        {
            source: '/about',
            headers: [
                {
                    key: "x-custom-header-1",
                    value: "my custom header 1"
                },
                {
                    key: "x-next-conf-key",
                    value: "x-next-coonf-value-header"
                }
            ]
        },
        {
            source: '/my-custom-page',
            headers: [
                {
                    key: "x-custom-page-header-1111",
                    value: "my custom-page header 11001"
                }
            ]
        }
      ]
  }


  return {
      env,
      rewrites,
      redirects,
      headers
  }
}
