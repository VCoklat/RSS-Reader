package vanhauten.reader.util;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import java.util.ArrayList;
import java.util.List;

import vanhauten.reader.data.RssItem;

/**
 * SAX tag handler
 * 
 * @author ITCuties
 *
 */
public class RssParseHandler extends DefaultHandler {

	private List<RssItem> rssItems;
	
	// Used to reference item while parsing
	private RssItem currentItem;
	
	// Parsing title indicator
	private boolean parsingTitle;
	// Parsing link indicator
	private boolean parsingLink;

	private boolean parsingDescription;
	
	public RssParseHandler() {
		rssItems = new ArrayList<RssItem>();
	}
	
	public List<RssItem> getItems() {
		return rssItems;
	}
	
	@Override
	public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
		if ("item".equals(qName)) {
			currentItem = new RssItem();
		} else if ("title".equals(qName)) {
			parsingTitle = true;
		} else if ("description".equals(qName)) {
			parsingDescription = true;
		} else if ("link".equals(qName)) {
			parsingLink = true;
		}
	}
	
	@Override
	public void endElement(String uri, String localName, String qName) throws SAXException {
		if ("item".equals(qName)) {
			rssItems.add(currentItem);
			currentItem = null;
		} else if ("title".equals(qName)) {
			parsingTitle = false;
		} else if ("description".equals(qName)) {
			parsingDescription = false;
		} else if ("link".equals(qName)) {
			parsingLink = false;
		}
	}
	
	@Override
	public void characters(char[] ch, int start, int length) throws SAXException {
		if (parsingTitle) {
			if (currentItem != null)
				currentItem.setTitle(new String(ch, start, length));
		} else if (parsingDescription) {
			if (currentItem != null) {
				currentItem.setDescription(new String(ch, start, length));
				parsingDescription = false;
			}
		} else if (parsingLink) {
			if (currentItem != null) {
				currentItem.setLink(new String(ch, start, length));
				parsingLink = false;
			}
		}
	}
	
}
