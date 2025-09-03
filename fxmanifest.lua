fx_version 'cerulean'
game 'gta5'
author 'https://github.com/MOXHARTZ'
repository 'https://github.com/MOXHARTZ/mx-audioplayer'
discord 'https://discord.gg/crbtDw9hT7'
version '3.1.2'
lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/*.lua'
}

client_scripts {
    'client/framework/*.lua',
    'client/modules/audioplayer.lua',
    'client/*.lua',
    'client/modules/auth.lua',
    'client/addons/*.lua',
}
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/framework/*.lua',
    'server/modules/*.lua',
    'server/*.lua'
}

ui_page 'web/build/index.html'
-- ui_page 'http://localhost:3005/' -- dev

files({
    'locales/*.json',
    'web/build/index.html',
    'web/build/**/*',
    'client/modules/audioplayer.lua',
})

dependencies {
    '/onesync',
    'mx-surround',
    'oxmysql',
    'ox_lib'
}
