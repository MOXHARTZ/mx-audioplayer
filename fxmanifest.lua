fx_version 'cerulean'
games { 'gta5' }
author 'https://github.com/MOXHARTZ'
repository 'https://github.com/MOXHARTZ/mx-audioplayer'
discord 'https://discord.gg/crbtDw9hT7'
version '2.8.6'
lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/*.lua'
}

client_scripts {
    'client/framework/*.lua',
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

-- ui_page 'ui/build/index.html'
ui_page 'http://localhost:5173/' -- dev

files({
    'locales/*.json',
    'ui/build/index.html',
    'ui/build/**/*',
    'client/modules/audioplayer.lua',
})

dependencies {
    '/onesync',
    'mx-surround',
    'oxmysql',
    'ox_lib'
}
