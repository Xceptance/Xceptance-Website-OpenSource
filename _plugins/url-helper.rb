module Jekyll
  module RelativeFilter

    # Remove leading slash from urls
    def to_relativeurl(url)
        if url.start_with?("/")
            url[1..-1]
        else
            url
        end 
    end

    # builds a url and prepends language if needed
    def to_absoluteurl(url)
        if url.start_with?("/")
            "/" + @context.registers[:site].config['lang'] + url
        else
            "/" + @context.registers[:site].config['lang'] + "/" + url
        end
    end
  end
end

Liquid::Template.register_filter(Jekyll::RelativeFilter)
