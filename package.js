Package.describe({
  name: 'lookback:tooltips',
  summary: 'Reactive tooltips.',
  version: '0.7.0',
  git: 'https://github.com/lookback/meteor-tooltips.git'
});

Package.on_use(function(api) {
  api.versionsFrom('1.0.4');
  api.use('reactive-var jquery templating tracker'.split(' '), 'client');

  api.add_files('tooltips.html tooltips.js'.split(' '), 'client');
  api.export('Tooltips', 'client');
});
