fx_version 'cerulean'
games { 'gta5' }
author 'https://github.com/MOXHARTZ'
repository 'https://github.com/MOXHARTZ/mx-audioplayer'
version '1.3.0'
lua54 'yes'

shared_scripts {
    'shared/*.lua'
}

client_scripts {
    'client/*.lua'
}
server_scripts {
    'server/*.lua'
}

ui_page 'ui/build/index.html'
-- ui_page 'http://localhost:5173/' -- dev

files({
    'locales/*.json',
    'ui/build/index.html',
    'ui/build/**/*',
})

dependencies {
    'mx-surround'
}
