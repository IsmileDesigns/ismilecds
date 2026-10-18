export async function onRequest(context) {
  const url = new URL(context.request.url);
  let shouldRedirect = false;

  if (url.hostname === 'byismile.com') {
    url.hostname = 'www.byismile.com';
    shouldRedirect = true;
  }

  if (url.pathname.startsWith('/The%20Ember%20Room/') || url.pathname.startsWith('/The Ember Room/')) {
    url.pathname = url.pathname.replace(/^\/The(?:%20| )Ember(?:%20| )Room\//, '/the-ember-room/');
    shouldRedirect = true;
  }

  if (shouldRedirect) return Response.redirect(url.toString(), 301);

  return context.next();
}
