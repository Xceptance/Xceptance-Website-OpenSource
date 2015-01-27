# Open-Source-Version of Xceptance' WebSite

This is the open source version of our company's website. We want to share how we used Jekyll, Less, and others. It also shows some tricks around localization as well as demonstrates some htaccess magic. This is used to route old URLs to new landing pages and make the entire website HTTPS only. But let's discuss the most important points in separate chapters.

## Xceptance
[Xceptance](https://www.xceptance.com/) is german-american company dedicated for software testing. We help our clients optimize their testing and enhance their final product. Recently we decided to revamp our public-facing website and put quite some effort into enhancing Jekyll. We want to show our work and encourage you to use it for your own projects.

##  The Basic Idea

We wanted to have our new website statically generated to avoid the need for frequent software updates as well as to have everything in GIT for easy versioning. Only Jekyll offered that and of course its cousins as well. There was also [HUGO](http://gohugo.io/), but we discovered the project too late to consider it. Maybe the next time.

The lack of internationalization capabilities is very annoying independent of the framework used. We made the mistake to ignore that fact in the design and decision process because we just thought, Jekyll has a large community and there will be a good solution for it. This and a couple of tricks we had to do to generate the URLs and the menu correctly were the largest pain points. This is also the reason for giving this back to the world, because we want to have others benefit from our work as we benefited from the work of others.

### Multiple Domains

Our website runs under a .de and a .com domain, so we needed something that does not hard-code host names into the URLs. Therefore all URLs and links are relative or absolute but without a host name. For some of the URL problems in terms of being relative, we wrote a small helper to workaround Jekyll URLs generation problems, see `_plugins/URL-helper.rb`.

By the way, later we decided to run the entire site HTTPS only and under a single host name. Therefore the .de domain is only redirecting to .com now and appends the language in the process. We could have saved us some pain if we considered that in the beginning.

## Two Languages

While having two domains, we also needed two languages. Luckily we could agree on running all pages and posts in both languages without the need of additional filtering. This made it a lot easier.

We use the [jekyll-multiple-languages-plugin](https://github.com/screeninteraction/jekyll-multiple-languages-plugin).

While is is basically easy to use, it has some limitations. First of all, it creates an extra copy of the site in a default language. This is very inconvenient when you need two named languages and you do not want to have a fall back.

Additionally it does not allow easily to localize posts. In our case news and jobs. We had to include both language versions in the same file and put a `{% if site.lang == 'en' %}` around it. This also limits us a little. Because you cannot exclude certain entries from a language. Not to forget that this does not really work fine for a large set of languages.

Jekyll is not very fast. Running it with two target languages (and the overhead default), makes it even slower. So be patient, especially when you are running it in watch mode.

## Mapping Languages to Subdirectories

We decided that we are not going to serve the default language actively, but use the images and files of it to avoid language specific subfolder for CSS, JS, and images. So we copy the data to our hoster even though we use only some of it.

## Running HTTPS only

The `.htaccess` will tell you that we decided to run the entire website HTTPS only. We only have one certificate for xceptance.com in place, hence we have to force xceptance.de traffic over to .com to be able to use HTTPS without warnings. We are also issuing an HSTS header to tell the browsers that HTTP will never be OK and so it should not accept HTTP in the near future for that host.

## Some Performance Tuning via .htaccess

A section of the `.htaccess` file is dedicated to the tuning of the static delivery. There are so many suggestions available and a lot of them contradict each other, we tried to keep it as simple as possible. Our hoster runs Apache and so our rule set is made for Apache. You should have mod_gzip, mod_expire, and maybe mod_deflate installed. Suggestions are always welcome to tune it better.

## Deploying

You will find a short example of a build and ftp upload script in the `bin` directory. We run a Jenkins that polls the GIT repos for two branches `master` and `live-branch`. While `master` is deployed to a non-public test installation, the `live-branch` is our later publicly available version.

We develop in `master` and check everything first locally via `jekyll serve` and later on directly on our non-public test site. If we are satisfied with the quality and content, we create a pull request for the `live-branch` and merge all changes. The Jenkins job will deploy this change set in about 2 to 5 minutes after the merge to our live site.

## Open Sourcing the Latest Code

`bin` contains a small shell script named `makeGitHubVersion.sh` that turns the internal version of our GIT repo for the website into the open-sourced version. It will mainly strip out some overhead and watermark the images. The employee gallery will be obfuscated on top of the watermarking.

## Projects Used

The projects are not always used in their latest version. We are trying to stay latest but due to the release frequencies and the effort to update things, we rather do that less often as long as now security related problems arises. 

* Jekyll - http://jekyllrb.com/
* Bootstrap - http://getbootstrap.com/
* Less - http://lesscss.org/
* FontAwesome - http://fontawesome.io/
* jekyll-multiple-languages-plugin - https://github.com/screeninteraction/jekyll-multiple-languages-plugin

## Licenses

All components copied from the original projects such as Less and JavaScript files are still licensed under the original project license. This applies but is not limited to the following projects:

* Bootstrap: MIT License
* FontAwesome: SIL OFL 1.1 and MIT License
* JQuery: MIT License

### Code

* All code that has not been taken from other projects, is licensed under the MIT License - http://opensource.org/licenses/MIT
* Some examples are our Less file `xceptance.less`, the pagination and menu code in `_includes`, the build script `bin/jenkins-build.sh`, `_plugins/URL-helper.rb` and `.htaccess`.

### Textual Content

* Applies to all text content on this site.
* Creative Commons by Attribution-ShareAlike 4.0 - http://creativecommons.org/licenses/by-sa/4.0/

### Design

* The design of the site is licensed under Creative Commons by Attribution-ShareAlike 4.0 - http://creativecommons.org/licenses/by-sa/4.0/

### Images

* All images are watermarked with "Example Only" and hence are not free in any way. This is for simplification of sharing and does not necessarily mean that you cannot obtain a free license from us for using these images.
* If you like an image and want to use and modify it, feel free to drop us a line (https://www.xceptance.com/en/contact/).

### Brand Mentioning

* All brands are trademarks of their respective owners.
* The use of these trademarks does not indicate endorsement of the trademark holder by Xceptance, nor vice versa.

