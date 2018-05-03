import Q from 'q';
import request from 'superagent';
import _ from 'lodash';
import { generateIndex } from './indexGenerator';
import { generatePost } from './postGenerator';
import { generatePosts } from './postsGenerator';
import { generateTags } from './tagsGenerator';
import { generateAuthors } from './authorsGenerator';
import Builder from 'hubpress-plugin-builder-ghost'

function load(name, config) {

  let deferred = Q.defer();
  let promises = [];
  let hubpressUrl = config.urls.hubpress;
  request.get(`${hubpressUrl}/themes/${name}/theme.json?dt=${Date.now()}`)
    .end((err, response) => {
      if (err) {
        deferred.reject(err);
        return;
      }
      let theme = response.body;
      let version = theme.version;
      let files = _.toPairs(theme.files);

      let paginationLoaded = false;
      let navLoaded = false;
      let navigationLoaded = false;

      files.forEach((file) => {
        let deferredFile = Q.defer();
        promises.push(deferredFile.promise);

        paginationLoaded = paginationLoaded || file[0] === 'pagination';
        navLoaded = navLoaded || file[0] === 'nav';
        navigationLoaded = navigationLoaded || file[0] === 'navigation';

        request.get(`${hubpressUrl}/themes/${name}/${file[1]}?v=${version}`)
          .end((err, response) => {
            if (err) {
              deferredFile.reject(err);
              return;
            }
            deferredFile.resolve({
              name: file[0],
              path: file[1],
              content: response.text
            });

          });

      });

      if (!paginationLoaded) {
        let deferredPagination = Q.defer();
        promises.push(deferredPagination.promise);
        request.get(`${hubpressUrl}/hubpress/scripts/helpers/tpl/pagination.hbs`)
          .end((err, response) => {
            if (err) {
              deferredPagination.reject(err);
              return;
            }

            deferredPagination.resolve({
              name: 'pagination',
              path: 'partials/pagination',
              content: response.text
            });
          });
      }

      if (!navLoaded) {
        let deferredNav = Q.defer();
        promises.push(deferredNav.promise);
        request.get(`${hubpressUrl}/hubpress/scripts/helpers/tpl/nav.hbs`)
          .end((err, response) => {
            if (err) {
              deferredNav.reject(err);
              return;
            }
            deferredNav.resolve({
              name: 'nav',
              path: 'partials/nav',
              content: response.text
            });
          });
      }

      if (!navigationLoaded) {
        let deferredNav = Q.defer();
        promises.push(deferredNav.promise);
        request.get(`${hubpressUrl}/hubpress/scripts/helpers/tpl/navigation.hbs`)
          .end((err, response) => {
            if (err) {
              deferredNav.reject(err);
              return;
            }
            deferredNav.resolve({
              name: 'navigation',
              path: 'partials/navigation',
              content: response.text
            });
          });
      }

      Q.all(promises)
        .then((values)=>{
          deferred.resolve({
            version: version,
            files: values
          });
        })
        .catch((error) => {
          console.log(error);
          deferred.reject(error);
        });
    });

  return deferred.promise;
}

export function templatePlugin (context) {

  context.on('hubpress:request-theme', function (opts) {
    console.info('templatePlugin Plugin - hubpress:request-theme');
    console.log('hubpress:request-theme', opts);
    // lowerCase is useless after version 0.6.0
    const themeName = opts.rootState.application.config.theme.name.toLowerCase()
    const configuration = opts.rootState.application.config

    return load(themeName, configuration)
      .then((themeInfos) => {
        const theme = {
          name: themeName,
          files: themeInfos.files,
          version: themeInfos.version
        };

        Builder.registerTheme(configuration, theme)
        Builder.registerFiles(theme.files)

        const mergeTheme = Object.assign({}, theme)
        opts.nextState = Object.assign({}, opts.nextState, {theme: mergeTheme})
        return opts
      });
  });

  context.on('requestGenerateIndex', opts => {
    console.info('Template Plugin - requestGenerateIndex');
    console.log('requestGenerateIndex', opts);
    const updatedOpts = generateIndex(opts);
    console.log('requestGenerateIndex return', updatedOpts);
    return updatedOpts
  });

  context.on('requestGeneratePost', opts => {
    console.info('Template Plugin - requestGeneratePost');
    console.log('requestGeneratePost', opts);
    const updatedOpts = generatePost(opts, opts.nextState.post);
    console.log('requestGeneratePost return', updatedOpts);
    return updatedOpts
  });

  context.on('requestGeneratePosts', opts => {
    console.info('Template Plugin - requestGeneratePosts');
    console.log('requestGeneratePosts', opts);
    const updatedOpts = generatePosts(opts);
    console.log('requestGeneratePosts return', updatedOpts);
    return updatedOpts
  });

  context.on('requestGenerateTags', opts => {
    console.info('Template Plugin - requestGenerateTags');
    console.log('requestGenerateTags', opts);
    const updatedOpts = generateTags(opts);
    console.log('requestGenerateTags return', updatedOpts);
    return updatedOpts
  });

  context.on('requestGenerateAuthors', opts => {
    console.info('Template Plugin - requestGenerateAuthors');
    console.log('requestGenerateAuthors', opts);
    const updatedOpts = generateAuthors(opts);
    console.log('requestGenerateAuthors return', updatedOpts);
    return updatedOpts
  });

  

}
